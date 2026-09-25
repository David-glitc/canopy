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

const DISC_GROVE = {
  create_grove: Uint8Array.from(Buffer.from("f3add15e6a08792e", "hex")),
  deposit: Uint8Array.from(Buffer.from("f223c68952e1f2b6", "hex")),
  close_grove: Uint8Array.from(Buffer.from("8c9a7dc6b126e2c6", "hex")),
  cancel_grove: Uint8Array.from(Buffer.from("031acd931c18e9e5", "hex")),
  refund: Uint8Array.from(Buffer.from("0260b7fb3fd02e2e", "hex")),
  commit_reveal: Uint8Array.from(Buffer.from("1e8b22385ef672f3", "hex")),
  reveal: Uint8Array.from(Buffer.from("09233bbea7f94c73", "hex")),
};

const i64 = (n: bigint | number): Uint8Array => {
  const b = new Uint8Array(8);
  new DataView(b.buffer).setBigInt64(0, BigInt(n), true);
  return b;
};

export const revealPda = (grove: PublicKey): PublicKey =>
  PublicKey.findProgramAddressSync([Buffer.from("reveal"), grove.toBuffer()], CANOPY_ID)[0];

export type GroveData = {
  creator: string;
  nonce: bigint;
  quoteMint: string;
  vault: string;
  goal: bigint;
  deadline: bigint;
  minDeposit: bigint;
  total: bigint;
  shareCount: number;
  status: number;
  bump: number;
};

export function parseGrove(data: Uint8Array): GroveData {
  const pk = (o: number) => new PublicKey(data.subarray(o, o + 32)).toBase58();
  const u64at = (o: number) => new DataView(data.buffer, data.byteOffset + o, 8).getBigUint64(0, true);
  return {
    creator: pk(8),
    nonce: u64at(40),
    quoteMint: pk(48),
    vault: pk(80),
    goal: u64at(112),
    deadline: new DataView(data.buffer, data.byteOffset + 120, 8).getBigInt64(0, true),
    minDeposit: u64at(128),
    total: u64at(136),
    shareCount: new DataView(data.buffer, data.byteOffset + 144, 4).getUint32(0, true),
    status: data[148],
    bump: data[149],
  };
}

export type RecordData = {
  grove: string;
  owner: string;
  deposit: bigint;
  coreAsset: string;
  index: number;
  revealed: boolean;
  weight: bigint;
  status: number;
};

export function parseRecord(data: Uint8Array): RecordData {
  const pk = (o: number) => new PublicKey(data.subarray(o, o + 32)).toBase58();
  const u64at = (o: number) => new DataView(data.buffer, data.byteOffset + o, 8).getBigUint64(0, true);
  return {
    grove: pk(8),
    owner: pk(40),
    deposit: u64at(72),
    coreAsset: pk(80),
    index: new DataView(data.buffer, data.byteOffset + 112, 4).getUint32(0, true),
    revealed: data[116] === 1,
    weight: u64at(117),
    status: data[125],
  };
}

export function buildCreateGrove(args: {
  creator: PublicKey;
  nonce: bigint;
  goal: bigint;
  deadline: bigint;
  minDeposit: bigint;
  grove: PublicKey;
  vault: PublicKey;
}): TransactionInstruction {
  const { creator, nonce, goal, deadline, minDeposit, grove, vault } = args;
  return new TransactionInstruction({
    programId: CANOPY_ID,
    keys: [
      { pubkey: creator, isSigner: true, isWritable: true },
      { pubkey: grove, isSigner: false, isWritable: true },
      { pubkey: vault, isSigner: false, isWritable: true },
      { pubkey: MUSDC, isSigner: false, isWritable: false },
      { pubkey: TOKEN_2022_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: Buffer.from(
      concat(DISC_GROVE.create_grove, u64(nonce), u64(goal), i64(deadline), u64(minDeposit))
    ),
  });
}

export function buildDeposit(args: {
  depositor: PublicKey;
  creator: PublicKey;
  nonce: bigint;
  index: number;
  amount: bigint;
  name: string;
  uri: string;
  grove: PublicKey;
  vault: PublicKey;
  depositorAta: PublicKey;
  record: PublicKey;
  asset: PublicKey;
}): TransactionInstruction {
  const { depositor, creator, nonce, index, amount, name, uri, grove, vault, depositorAta, record, asset } = args;
  return new TransactionInstruction({
    programId: CANOPY_ID,
    keys: [
      { pubkey: depositor, isSigner: true, isWritable: true },
      { pubkey: grove, isSigner: false, isWritable: true },
      { pubkey: vault, isSigner: false, isWritable: true },
      { pubkey: depositorAta, isSigner: false, isWritable: true },
      { pubkey: MUSDC, isSigner: false, isWritable: false },
      { pubkey: record, isSigner: false, isWritable: true },
      { pubkey: asset, isSigner: true, isWritable: true },
      { pubkey: CONFIG_PDA, isSigner: false, isWritable: false },
      { pubkey: CORE_ID, isSigner: false, isWritable: false },
      { pubkey: TOKEN_2022_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: Buffer.from(
      concat(
        DISC_GROVE.deposit,
        creator.toBuffer(),
        u64(nonce),
        u32(index),
        u64(amount),
        u8(DECIMALS),
        encStr(name),
        encStr(uri)
      )
    ),
  });
}

export function buildCloseGrove(args: {
  grove: PublicKey;
  creator: PublicKey;
  nonce: bigint;
  cancel: boolean;
}): TransactionInstruction {
  const { grove, creator, nonce, cancel } = args;
  return new TransactionInstruction({
    programId: CANOPY_ID,
    keys: [{ pubkey: grove, isSigner: false, isWritable: true }],
    data: Buffer.from(
      concat(cancel ? DISC_GROVE.cancel_grove : DISC_GROVE.close_grove, creator.toBuffer(), u64(nonce))
    ),
  });
}

export function buildCommitReveal(args: {
  keeper: PublicKey;
  grove: PublicKey;
  creator: PublicKey;
  nonce: bigint;
  revealState: PublicKey;
}): TransactionInstruction {
  const { keeper, grove, creator, nonce, revealState } = args;
  return new TransactionInstruction({
    programId: CANOPY_ID,
    keys: [
      { pubkey: grove, isSigner: false, isWritable: false },
      { pubkey: revealState, isSigner: false, isWritable: true },
      { pubkey: keeper, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: Buffer.from(
      concat(DISC_GROVE.commit_reveal, creator.toBuffer(), u64(nonce))
    ),
  });
}

export function buildReveal(args: {
  keeper: PublicKey;
  grove: PublicKey;
  creator: PublicKey;
  nonce: bigint;
  revealState: PublicKey;
  pairs: Array<{ record: PublicKey; asset: PublicKey }>;
}): TransactionInstruction {
  const { keeper, grove, creator, nonce, revealState, pairs } = args;
  const keys = [
    { pubkey: grove, isSigner: false, isWritable: true },
    { pubkey: revealState, isSigner: false, isWritable: true },
    { pubkey: CORE_ID, isSigner: false, isWritable: false },
    { pubkey: CONFIG_PDA, isSigner: false, isWritable: false },
    { pubkey: keeper, isSigner: true, isWritable: true },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    { pubkey: SLOT_HASHES, isSigner: false, isWritable: false },
  ];
  for (const p of pairs) {
    keys.push({ pubkey: p.record, isSigner: false, isWritable: true });
    keys.push({ pubkey: p.asset, isSigner: false, isWritable: true });
  }
  return new TransactionInstruction({
    programId: CANOPY_ID,
    keys,
    data: Buffer.from(concat(DISC_GROVE.reveal, creator.toBuffer(), u64(nonce))),
  });
}

export function buildRefund(args: {
  depositor: PublicKey;
  grove: PublicKey;
  creator: PublicKey;
  nonce: bigint;
  index: number;
  vault: PublicKey;
  depositorAta: PublicKey;
  record: PublicKey;
}): TransactionInstruction {
  const { depositor, grove, creator, nonce, index, vault, depositorAta, record } = args;
  return new TransactionInstruction({
    programId: CANOPY_ID,
    keys: [
      { pubkey: depositor, isSigner: true, isWritable: false },
      { pubkey: grove, isSigner: false, isWritable: false },
      { pubkey: vault, isSigner: false, isWritable: true },
      { pubkey: depositorAta, isSigner: false, isWritable: true },
      { pubkey: MUSDC, isSigner: false, isWritable: false },
      { pubkey: record, isSigner: false, isWritable: true },
      { pubkey: TOKEN_2022_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data: Buffer.from(
      concat(DISC_GROVE.refund, creator.toBuffer(), u64(nonce), u32(index), u8(DECIMALS))
    ),
  });
}
