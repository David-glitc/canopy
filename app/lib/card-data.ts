// Server-side Share data: Core asset + (pool) RevealState -> render seed.
import { Connection, PublicKey } from "@solana/web3.js";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { fetchAsset } from "@metaplex-foundation/mpl-core";
import { publicKey as umiPk } from "@metaplex-foundation/umi";
import { CANOPY_ID } from "./canopy-ix";

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
};

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
    const info = await connection.getAccountInfo(revealPda);
    if (info && info.data.length >= 82 && info.data[80] === 1) {
      const seedHex = Buffer.from(info.data.subarray(48, 80)).toString("hex");
      seedStr = `pool:${seedHex}:${index}`;
    }
  }

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
  };
}
