// Server-side Share data: Core asset + (pool) RevealState -> render seed.
import { Connection, PublicKey } from "@solana/web3.js";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { fetchAsset } from "@metaplex-foundation/mpl-core";
import { publicKey as umiPk } from "@metaplex-foundation/umi";
import { CANOPY_ID } from "./canopy-ix";
import { composeCard } from "../../packages/card-engine/compose.mjs";
import { loadVaultMetadata, type VaultMetadata } from "./vault-metadata";

const RPC = "https://api.devnet.solana.com";

export type ShareData = {
  mint: string;
  name: string;
  uri: string;
  owner: string;
  seedStr: string | null; // null when sealed (no DNA yet)
  economicRarity: string;
  weight: bigint | null;
  attrs: Record<string, string>;
  dna: string | null;
  matterDna: string | null;
  matterTraits: Array<{ trait_type: string; value: string }>;
  position: MarketPosition | null;
  tokenSet: MarketPosition[];
  vaultMetadata: VaultMetadata | null;
};

export type MarketPosition = {
  symbol: string;
  mint: string;
  source: "PreStocks" | "xStocks";
  referencePrice: number | null;
  weight: number;
};

function positionFromUri(uri: string): MarketPosition | null {
  try {
    const params = new URL(uri).searchParams;
    const symbol = params.get("asset")?.slice(0, 24).toUpperCase();
    const mint = params.get("contract")?.slice(0, 64);
    if (!symbol || !mint) return null;
    const rawPrice = Number(params.get("price"));
    return {
      symbol,
      mint,
      source: params.get("source") === "xStocks" ? "xStocks" : "PreStocks",
      referencePrice: Number.isFinite(rawPrice) && rawPrice > 0 ? rawPrice : null,
      weight: 100,
    };
  } catch {
    return null;
  }
}

export function bandForWeight(weight: bigint): string {
  const P = 10_000_000_000_000_000n;
  if (weight >= 40n * P) return "Legendary";
  if (weight >= 20n * P) return "Epic";
  if (weight >= 8n * P) return "Rare";
  return "Common";
}

export async function fetchShare(
  mint: string,
  grove?: string,
  index?: string
): Promise<ShareData | null> {
  const umi = createUmi(RPC);
  let asset: Awaited<ReturnType<typeof fetchAsset>>;
  try {
    asset = await fetchAsset(umi, umiPk(mint));
  } catch {
    return null;
  }
  const attrs: Record<string, string> = Object.fromEntries(
    (asset.attributes?.attributeList ?? []).map((a) => [a.key, a.value])
  );
  const weight = attrs.weight_1e18 ? BigInt(attrs.weight_1e18) : null;
  const economicRarity = weight !== null ? bandForWeight(weight) : "Common";

  let seedStr: string | null = null;
  let vaultMetadata: VaultMetadata | null = null;
  if (attrs.dna) {
    seedStr = `instant:${attrs.dna}`;
  } else if (grove !== undefined && index !== undefined) {
    // Pool DNA = hash(revealSeed || index); revealSeed lives in RevealState.
    const grovePk = new PublicKey(grove);
    const [revealPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("reveal"), grovePk.toBuffer()],
      CANOPY_ID
    );
    const connection = new Connection(RPC, "confirmed");
    vaultMetadata = await loadVaultMetadata(connection, grove);
    const info = await connection.getAccountInfo(revealPda);
    if (info && info.data.length >= 82 && info.data[80] === 1) {
      const seedHex = Buffer.from(info.data.subarray(48, 80)).toString("hex");
      seedStr = `pool:${seedHex}:${index}`;
    }
  }
  const matterSpec = seedStr ? composeCard(seedStr, economicRarity) : null;
  const position = positionFromUri(asset.uri);
  const tokenSet = vaultMetadata?.tokens.map((token) => ({
    symbol: token.symbol,
    mint: token.mint,
    source: token.source,
    referencePrice: null,
    weight: token.weightBps / 100,
  })) ?? (position ? [position] : []);

  return {
    mint,
    name: asset.name,
    uri: asset.uri,
    owner: asset.owner,
    seedStr,
    economicRarity,
    weight,
    attrs,
    dna: attrs.dna ?? null,
    matterDna: matterSpec?.dna ?? null,
    matterTraits: matterSpec?.traits ?? [],
    position,
    tokenSet,
    vaultMetadata,
  };
}
