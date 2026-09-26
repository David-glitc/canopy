import { PublicKey, TransactionInstruction, type Connection } from "@solana/web3.js";

const MEMO_PROGRAM = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
const PREFIX = "CANOPY_VAULT:";
const CACHE_PREFIX = "canopy:vault-metadata:";

export type VaultMetadata = {
  name: string;
  description: string;
  link: string | null;
  tokens: VaultToken[];
};

export type VaultToken = {
  symbol: string;
  mint: string;
  source: "PreStocks" | "xStocks";
  weightBps: number;
};

export function fallbackVaultMetadata(address: string): VaultMetadata {
  return {
    name: `Vault ${address.slice(0, 5)}·${address.slice(-4)}`,
    description: "A collective token-set funding cycle on Canopy.",
    link: null,
    tokens: [],
  };
}

function readCachedVaultMetadata(address: string): VaultMetadata | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(`${CACHE_PREFIX}${address}`);
    if (!raw) return null;
    const metadata = JSON.parse(raw) as VaultMetadata;
    return metadata.name && metadata.description && Array.isArray(metadata.tokens) ? metadata : null;
  } catch {
    return null;
  }
}

export function cacheVaultMetadata(address: string, metadata: VaultMetadata) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(`${CACHE_PREFIX}${address}`, JSON.stringify(metadata));
  } catch {
    // On-chain memo lookup remains the source of truth when storage is unavailable.
  }
}

export function normalizeVaultLink(value: string): string | null {
  const clean = value.trim();
  if (!clean) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(clean) ? clean : `https://${clean}`);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function buildVaultMemo(
  signer: PublicKey,
  grove: PublicKey,
  metadata: VaultMetadata
): TransactionInstruction {
  const data = `${PREFIX}${JSON.stringify({
    v: 2,
    g: grove.toBase58(),
    n: metadata.name.trim().slice(0, 36),
    d: metadata.description.trim().slice(0, 96),
    l: metadata.link?.slice(0, 80) ?? "",
    a: metadata.tokens.slice(0, 5).map((token) => [
      token.symbol.slice(0, 16),
      token.mint,
      token.source === "xStocks" ? "x" : "p",
      token.weightBps,
    ]),
  })}`;
  return new TransactionInstruction({
    programId: MEMO_PROGRAM,
    keys: [{ pubkey: signer, isSigner: true, isWritable: false }],
    data: Buffer.from(data, "utf8"),
  });
}

export function parseVaultMemo(memo: string | null, address: string): VaultMetadata | null {
  if (!memo) return null;
  const start = memo.indexOf(PREFIX);
  if (start < 0) return null;
  try {
    const payload = JSON.parse(memo.slice(start + PREFIX.length)) as {
      g?: string;
      n?: string;
      d?: string;
      l?: string;
      a?: Array<[string, string, "x" | "p", number]>;
    };
    if (payload.g !== address || !payload.n || !payload.d) return null;
    return {
      name: payload.n.slice(0, 48),
      description: payload.d.slice(0, 140),
      link: normalizeVaultLink(payload.l ?? ""),
      tokens: (payload.a ?? []).slice(0, 5).flatMap(([symbol, mint, source, weightBps]) => {
        if (!symbol || !mint || !Number.isInteger(weightBps) || weightBps <= 0) return [];
        return [{
          symbol: symbol.slice(0, 16),
          mint: mint.slice(0, 64),
          source: source === "x" ? "xStocks" as const : "PreStocks" as const,
          weightBps,
        }];
      }),
    };
  } catch {
    return null;
  }
}

export async function loadVaultMetadata(
  connection: Connection,
  address: string
): Promise<VaultMetadata> {
  const cached = readCachedVaultMetadata(address);
  if (cached) return cached;
  try {
    const signatures = await connection.getSignaturesForAddress(new PublicKey(address), { limit: 8 });
    for (const signature of signatures) {
      const metadata = parseVaultMemo(signature.memo, address);
      if (metadata) {
        cacheVaultMetadata(address, metadata);
        return metadata;
      }
    }
  } catch {
    // The on-chain vault still has a stable address-based identity.
  }
  return fallbackVaultMetadata(address);
}

/** Fetch memo-backed metadata in one RPC batch to avoid rate-limiting the vault index. */
export async function loadVaultMetadataBatch(
  connection: Connection,
  addresses: string[],
): Promise<Map<string, VaultMetadata>> {
  const result = new Map<string, VaultMetadata>();
  const missing: string[] = [];

  for (const address of addresses) {
    const cached = readCachedVaultMetadata(address);
    if (cached) result.set(address, cached);
    else missing.push(address);
  }

  if (missing.length > 0) {
    try {
      const response = await fetch(connection.rpcEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(missing.map((address, index) => ({
          jsonrpc: "2.0",
          id: index + 1,
          method: "getSignaturesForAddress",
          params: [address, { limit: 8, commitment: "confirmed" }],
        }))),
      });
      if (!response.ok) throw new Error(`Metadata RPC returned ${response.status}`);
      const payload = await response.json() as Array<{
        id: number;
        result?: Array<{ memo: string | null }>;
      }>;
      const byId = new Map(payload.map((entry) => [entry.id, entry.result ?? []]));
      missing.forEach((address, index) => {
        for (const signature of byId.get(index + 1) ?? []) {
          const metadata = parseVaultMemo(signature.memo, address);
          if (!metadata) continue;
          result.set(address, metadata);
          cacheVaultMetadata(address, metadata);
          break;
        }
      });
    } catch {
      // Address fallbacks below keep account discovery independent of metadata RPCs.
    }
  }

  for (const address of addresses) {
    if (!result.has(address)) result.set(address, fallbackVaultMetadata(address));
  }
  return result;
}
