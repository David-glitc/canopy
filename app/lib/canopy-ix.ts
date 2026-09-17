// Canopy instruction builders + PDAs (isomorphic, no Node APIs).
// Devnet registry. Mirrors scripts/prove-*.mjs (the proven paths).
import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";

export const CANOPY_ID = new PublicKey("9xmniHhMGswjyMGf9jW7YCireJaUARBozRSDWYU1Jrnf");
export const CORE_ID = new PublicKey("CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d");
export const MUSDC = new PublicKey("3PN7iGUrNyk6AgGkGRGx5mD9ftGRGWNJC3FRFkRRhLC5");
export const SLOT_HASHES = new PublicKey("SysvarS1otHashes111111111111111111111111111");
export const DECIMALS = 6;

export const CONFIG_PDA = PublicKey.findProgramAddressSync(
  [Buffer.from("config")],
  CANOPY_ID
)[0];
export const TREASURY_PDA = PublicKey.findProgramAddressSync(
  [Buffer.from("treasury")],
  CANOPY_ID
)[0];

const DISC = {
  instant_mint: Uint8Array.from(Buffer.from("468458d74a08d1ec", "hex")),
  claim: Uint8Array.from(Buffer.from("3ec6d6c1d59f6cd2", "hex")),
};

const u64 = (n: bigint | number): Uint8Array => {
  const b = new Uint8Array(8);
  new DataView(b.buffer).setBigUint64(0, BigInt(n), true);
  return b;
};
const u32 = (n: number): Uint8Array => {
  const b = new Uint8Array(4);
  new DataView(b.buffer).setUint32(0, n, true);
  return b;
};
const encStr = (s: string): Uint8Array => {
  const t = new TextEncoder().encode(s);
  const out = new Uint8Array(4 + t.length);
  new DataView(out.buffer).setUint32(0, t.length, true);
  out.set(t, 4);
  return out;
};
const u8 = (n: number): Uint8Array => Uint8Array.of(n);
const concat = (...parts: Uint8Array[]): Uint8Array => {
  const out = new Uint8Array(parts.reduce((s, p) => s + p.length, 0));
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
};

export const grovePda = (creator: PublicKey, nonce: bigint): PublicKey =>
  PublicKey.findProgramAddressSync(
    [Buffer.from("grove"), creator.toBuffer(), u64(nonce)],
    CANOPY_ID
  )[0];

export const recordPda = (grove: PublicKey, owner: PublicKey, index: number): PublicKey =>
  PublicKey.findProgramAddressSync(
    [Buffer.from("share"), grove.toBuffer(), owner.toBuffer(), u32(index)],
    CANOPY_ID
  )[0];

export const ata = (mint: PublicKey, owner: PublicKey): PublicKey =>
  getAssociatedTokenAddressSync(mint, owner, true, TOKEN_2022_PROGRAM_ID);

export function buildInstantMint(args: {
  payer: PublicKey;
  nonce: bigint;
  amount: bigint;
  name: string;
  uri: string;
  grove: PublicKey;
  vault: PublicKey;
  record: PublicKey;
  asset: PublicKey;
}): TransactionInstruction {
  const { payer, nonce, amount, name, uri, grove, vault, record, asset } = args;
  const treasuryVault = ata(MUSDC, TREASURY_PDA);
  const payerAta = ata(MUSDC, payer);
  return new TransactionInstruction({
    programId: CANOPY_ID,
    keys: [
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: grove, isSigner: false, isWritable: true },
      { pubkey: vault, isSigner: false, isWritable: true },
      { pubkey: TREASURY_PDA, isSigner: false, isWritable: false },
      { pubkey: treasuryVault, isSigner: false, isWritable: true },
      { pubkey: MUSDC, isSigner: false, isWritable: false },
      { pubkey: payerAta, isSigner: false, isWritable: true },
      { pubkey: record, isSigner: false, isWritable: true },
      { pubkey: asset, isSigner: true, isWritable: true },
      { pubkey: CONFIG_PDA, isSigner: false, isWritable: false },
      { pubkey: CORE_ID, isSigner: false, isWritable: false },
      { pubkey: TOKEN_2022_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: SLOT_HASHES, isSigner: false, isWritable: false },
    ],
    data: Buffer.from(
      concat(DISC.instant_mint, u64(nonce), u64(amount), u8(DECIMALS), encStr(name), encStr(uri))
    ),
  });
}

export function buildClaim(args: {
  owner: PublicKey;
  grove: PublicKey;
  nonce: bigint;
  index: number;
  vault: PublicKey;
  ownerAta: PublicKey;
  record: PublicKey;
  coreAsset: PublicKey;
}): TransactionInstruction {
  const { owner, grove, nonce, index, vault, ownerAta, record, coreAsset } = args;
  return new TransactionInstruction({
    programId: CANOPY_ID,
    keys: [
      { pubkey: owner, isSigner: true, isWritable: true },
      { pubkey: grove, isSigner: false, isWritable: false },
      { pubkey: vault, isSigner: false, isWritable: true },
      { pubkey: ownerAta, isSigner: false, isWritable: true },
      { pubkey: MUSDC, isSigner: false, isWritable: false },
      { pubkey: record, isSigner: false, isWritable: true },
      { pubkey: coreAsset, isSigner: false, isWritable: true },
      { pubkey: CONFIG_PDA, isSigner: false, isWritable: false },
      { pubkey: CORE_ID, isSigner: false, isWritable: false },
      { pubkey: TOKEN_2022_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: Buffer.from(
      concat(
        DISC.claim,
        owner.toBuffer(),
        u64(nonce),
        u32(index),
        u8(DECIMALS)
      )
    ),
  });
}
