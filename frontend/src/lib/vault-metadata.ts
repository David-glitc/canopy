import { PublicKey, TransactionInstruction, type Connection } from "@solana/web3.js";

const MEMO_PROGRAM = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
const PREFIX = "CANOPY_VAULT:";

export type VaultMetadata = {
  name: string;
  description: string;
  link: string | null;
};

export function fallbackVaultMetadata(address: string): VaultMetadata {
  return {
    name: `Vault ${address.slice(0, 5)}·${address.slice(-4)}`,
    description: "A collective token-set funding cycle on Canopy.",
    link: null,
  };
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
    v: 1,
    g: grove.toBase58(),
    n: metadata.name.trim().slice(0, 48),
    d: metadata.description.trim().slice(0, 140),
    l: metadata.link?.slice(0, 120) ?? "",
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
    };
    if (payload.g !== address || !payload.n || !payload.d) return null;
    return {
      name: payload.n.slice(0, 48),
      description: payload.d.slice(0, 140),
      link: normalizeVaultLink(payload.l ?? ""),
    };
  } catch {
    return null;
  }
}

export async function loadVaultMetadata(
  connection: Connection,
  address: string
): Promise<VaultMetadata> {
  try {
    const signatures = await connection.getSignaturesForAddress(new PublicKey(address), { limit: 8 });
    for (const signature of signatures) {
      const metadata = parseVaultMemo(signature.memo, address);
      if (metadata) return metadata;
    }
  } catch {
    // The on-chain vault still has a stable address-based identity.
  }
  return fallbackVaultMetadata(address);
}
