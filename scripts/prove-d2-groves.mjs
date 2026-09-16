// D2 proof: Grove lifecycle on devnet.
// Grove A: create -> 2 deposits -> close (goal met).
// Grove B: create -> 1 deposit -> deadline passes -> cancel -> refund (+ double-refund must fail).
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction,
} from "@solana/spl-token";

const CANOPY = new PublicKey("9xmniHhMGswjyMGf9jW7YCireJaUARBozRSDWYU1Jrnf");
const CORE = new PublicKey("CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d");
const MUSDC = new PublicKey("3PN7iGUrNyk6AgGkGRGx5mD9ftGRGWNJC3FRFkRRhLC5");
const RPC = "https://api.devnet.solana.com";

const disc = (n) => createHash("sha256").update(`global:${n}`).digest().subarray(0, 8);
const u64 = (n) => { const b = Buffer.alloc(8); b.writeBigUInt64LE(BigInt(n), 0); return b; };
const u32 = (n) => { const b = Buffer.alloc(4); b.writeUInt32LE(n, 0); return b; };
const i64 = (n) => { const b = Buffer.alloc(8); b.writeBigInt64LE(BigInt(n), 0); return b; };
const encStr = (s) => { const b = Buffer.from(s, "utf8"); const l = Buffer.alloc(4); l.writeUInt32LE(b.length, 0); return Buffer.concat([l, b]); };
const u8 = (n) => Buffer.from([n]);
const DECIMALS = 6; // mUSDC
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function getAcct(pubkey) {
  for (let i = 0; i < 15; i++) {
    try {
      const a = await connection.getAccountInfo(pubkey);
      if (a) return a;
    } catch {}
    await sleep(2000 + i * 1000);
  }
  throw new Error("getAccountInfo failed after retries");
}

const payer = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(readFileSync(process.env.CANOPY_PAYER ?? "/home/david/.config/solana/chessonchain-casino-deployer.json", "utf8")))
);
const connection = new Connection(RPC, "confirmed");
const [configPda] = PublicKey.findProgramAddressSync([Buffer.from("config")], CANOPY);

const grovePda = (creator, nonce) =>
  PublicKey.findProgramAddressSync(
    [Buffer.from("grove"), creator.toBuffer(), u64(nonce)],
    CANOPY
  )[0];
const recordPda = (grove, owner, index) =>
  PublicKey.findProgramAddressSync(
    [Buffer.from("share"), grove.toBuffer(), owner.toBuffer(), u32(index)],
    CANOPY
  )[0];
const ata = (mint, owner) =>
  getAssociatedTokenAddressSync(mint, owner, true, TOKEN_2022_PROGRAM_ID);

async function send(ixs, signers, label) {
  const sig = await sendAndConfirmTransaction(connection, new Transaction().add(...ixs), signers);
  console.log(`${label}: ${sig}`);
  return sig;
}
const assert = (c, l) => { console.log(c ? `PASS ${l}` : `FAIL ${l}`); if (!c) process.exitCode = 1; };
// Grove layout: disc8 creator32 nonce8 quote32 vault32 goal8 deadline8 min8 total8 count4 status1 bump1
function parseGrove(buf) {
  return {
    total: buf.readBigUInt64LE(8 + 32 + 8 + 32 + 32 + 8 + 8 + 8),
    count: buf.readUInt32LE(8 + 32 + 8 + 32 + 32 + 8 + 8 + 8 + 8),
    status: buf[8 + 32 + 8 + 32 + 32 + 8 + 8 + 8 + 8 + 4],
  };
}
// Record layout: disc8 grove32 owner32 deposit8 asset32 index4 revealed1 weight8 status1 bump1
function parseRecord(buf) {
  return { status: buf[8 + 32 + 32 + 8 + 32 + 4 + 1 + 8] };
}
async function tokenBalance(mint, owner) {
  const a = ata(mint, owner);
  for (let i = 0; i < 15; i++) {
    try {
      const info = await connection.getTokenAccountBalance(a);
      if (info) return BigInt(info.value.amount);
    } catch {}
    await sleep(2000 + i * 1000);
  }
  return 0n;
}

console.log("payer:", payer.publicKey.toBase58());
// second depositor
const bob = Keypair.generate();
{
  const tx = new Transaction().add(
    SystemProgram.transfer({ fromPubkey: payer.publicKey, toPubkey: bob.publicKey, lamports: 0.05 * LAMPORTS_PER_SOL })
  );
  await sendAndConfirmTransaction(connection, tx, [payer]);
  const bobAta = ata(MUSDC, bob.publicKey);
  await send(
    [createAssociatedTokenAccountInstruction(payer.publicKey, bobAta, bob.publicKey, MUSDC, TOKEN_2022_PROGRAM_ID)],
    [payer],
    "bob ata"
  );
  await send(
    [createTransferCheckedInstruction(ata(MUSDC, payer.publicKey), MUSDC, bobAta, payer.publicKey, 2_000_000, 6, [], TOKEN_2022_PROGRAM_ID)],
    [payer],
    "fund bob 2 mUSDC"
  );
}

// ---------- Grove A: fund to goal, close ----------
const nonceA = 5n;
const groveA = grovePda(payer.publicKey, nonceA);
const vaultA = ata(MUSDC, groveA);
const now = Math.floor(Date.now() / 1000);
await send(
  [
    new TransactionInstruction({
      programId: CANOPY,
      keys: [
        { pubkey: payer.publicKey, isSigner: true, isWritable: true },
        { pubkey: groveA, isSigner: false, isWritable: true },
        { pubkey: vaultA, isSigner: false, isWritable: true },
        { pubkey: MUSDC, isSigner: false, isWritable: false },
        { pubkey: TOKEN_2022_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: Buffer.concat([disc("create_grove"), u64(nonceA), u64(2_000_000), i64(now + 86400), u64(500_000)]),
    }),
  ],
  [payer],
  "create grove A"
);

async function deposit(grove, vault, who, whoAta, index, amount, tag) {
  const record = recordPda(grove, who.publicKey, index);
  const asset = Keypair.generate();
  const data = Buffer.concat([
    disc("deposit"),
    payer.publicKey.toBuffer(),
    u64(5n),
    u32(index),
    u64(amount),
    u8(DECIMALS),
    encStr(`Canopy Share ${tag}`),
    encStr("https://canopy.sol/share.json"),
  ]);
  // NOTE: creator+nonce must match this grove; Grove A uses nonce 5.
  await send(
    [
      new TransactionInstruction({
        programId: CANOPY,
        keys: [
          { pubkey: who.publicKey, isSigner: true, isWritable: true },
          { pubkey: grove, isSigner: false, isWritable: true },
          { pubkey: vault, isSigner: false, isWritable: true },
          { pubkey: whoAta, isSigner: false, isWritable: true },
          { pubkey: MUSDC, isSigner: false, isWritable: false },
          { pubkey: record, isSigner: false, isWritable: true },
          { pubkey: asset.publicKey, isSigner: true, isWritable: true },
          { pubkey: configPda, isSigner: false, isWritable: false },
          { pubkey: CORE, isSigner: false, isWritable: false },
          { pubkey: TOKEN_2022_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data,
      }),
    ],
    who === payer ? [payer, asset] : [bob, asset],
    `deposit ${tag}`
  );
  return { record, asset: asset.publicKey };
}

const payerAta = ata(MUSDC, payer.publicKey);
const bobAta = ata(MUSDC, bob.publicKey);
await deposit(groveA, vaultA, payer, payerAta, 0, 1_500_000, "A-0 payer 1.5");
await deposit(groveA, vaultA, bob, bobAta, 1, 1_000_000, "A-1 bob 1.0");

let g = parseGrove((await getAcct(groveA)).data);
assert(g.total === 2_500_000n && g.count === 2 && g.status === 0, `grove A funded (total=${g.total} count=${g.count})`);

await send(
  [
    new TransactionInstruction({
      programId: CANOPY,
      keys: [{ pubkey: groveA, isSigner: false, isWritable: true }],
      data: Buffer.concat([disc("close_grove"), payer.publicKey.toBuffer(), u64(nonceA)]),
    }),
  ],
  [payer],
  "close grove A"
);
g = parseGrove((await getAcct(groveA)).data);
assert(g.status === 1, "grove A Closed");

// ---------- Grove B: underfund, expire, cancel, refund ----------
const nonceB = 6n;
const groveB = grovePda(payer.publicKey, nonceB);
const vaultB = ata(MUSDC, groveB);
const nowB = Math.floor(Date.now() / 1000);
await send(
  [
    new TransactionInstruction({
      programId: CANOPY,
      keys: [
        { pubkey: payer.publicKey, isSigner: true, isWritable: true },
        { pubkey: groveB, isSigner: false, isWritable: true },
        { pubkey: vaultB, isSigner: false, isWritable: true },
        { pubkey: MUSDC, isSigner: false, isWritable: false },
        { pubkey: TOKEN_2022_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: Buffer.concat([disc("create_grove"), u64(nonceB), u64(100_000_000), i64(nowB + 45), u64(100_000)]),
    }),
  ],
  [payer],
  "create grove B"
);
// deposit helper hardcodes nonce 1; inline B deposit with nonce 2
{
  const asset = Keypair.generate();
  const record = recordPda(groveB, payer.publicKey, 0);
  const data = Buffer.concat([
    disc("deposit"),
    payer.publicKey.toBuffer(),
    u64(nonceB),
    u32(0),
    u64(500_000),
    u8(DECIMALS),
    encStr("Canopy Share B-0"),
    encStr("https://canopy.sol/share.json"),
  ]);
  await send(
    [
      new TransactionInstruction({
        programId: CANOPY,
        keys: [
          { pubkey: payer.publicKey, isSigner: true, isWritable: true },
          { pubkey: groveB, isSigner: false, isWritable: true },
          { pubkey: vaultB, isSigner: false, isWritable: true },
          { pubkey: payerAta, isSigner: false, isWritable: true },
          { pubkey: MUSDC, isSigner: false, isWritable: false },
          { pubkey: record, isSigner: false, isWritable: true },
          { pubkey: asset.publicKey, isSigner: true, isWritable: true },
          { pubkey: configPda, isSigner: false, isWritable: false },
          { pubkey: CORE, isSigner: false, isWritable: false },
          { pubkey: TOKEN_2022_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data,
      }),
    ],
    [payer, asset],
    "deposit B-0 payer 0.5"
  );
}
console.log("waiting for B deadline (~60s)...");
await sleep(65000);
await send(
  [
    new TransactionInstruction({
      programId: CANOPY,
      keys: [{ pubkey: groveB, isSigner: false, isWritable: true }],
      data: Buffer.concat([disc("cancel_grove"), payer.publicKey.toBuffer(), u64(nonceB)]),
    }),
  ],
  [payer],
  "cancel grove B"
);
g = parseGrove((await getAcct(groveB)).data);
assert(g.status === 2, "grove B Cancelled");

const before = await tokenBalance(MUSDC, payer.publicKey);
const recordB = recordPda(groveB, payer.publicKey, 0);
await send(
  [
    new TransactionInstruction({
      programId: CANOPY,
      keys: [
        { pubkey: payer.publicKey, isSigner: true, isWritable: false },
        { pubkey: groveB, isSigner: false, isWritable: false },
        { pubkey: vaultB, isSigner: false, isWritable: true },
        { pubkey: payerAta, isSigner: false, isWritable: true },
        { pubkey: MUSDC, isSigner: false, isWritable: false },
        { pubkey: recordB, isSigner: false, isWritable: true },
        { pubkey: TOKEN_2022_PROGRAM_ID, isSigner: false, isWritable: false },
      ],
      data: Buffer.concat([disc("refund"), payer.publicKey.toBuffer(), u64(nonceB), u32(0), u8(DECIMALS)]),
    }),
  ],
  [payer],
  "refund B-0"
);
const after = await tokenBalance(MUSDC, payer.publicKey);
assert(after - before === 500_000n, `refund repaid 0.5 mUSDC (delta=${after - before})`);
const rec = parseRecord((await getAcct(recordB)).data);
assert(rec.status === 1, "record marked Refunded");

// double refund must fail
let doubleFailed = false;
try {
  await send(
    [
      new TransactionInstruction({
        programId: CANOPY,
        keys: [
          { pubkey: payer.publicKey, isSigner: true, isWritable: false },
          { pubkey: groveB, isSigner: false, isWritable: false },
          { pubkey: vaultB, isSigner: false, isWritable: true },
          { pubkey: payerAta, isSigner: false, isWritable: true },
          { pubkey: MUSDC, isSigner: false, isWritable: false },
          { pubkey: recordB, isSigner: false, isWritable: true },
          { pubkey: TOKEN_2022_PROGRAM_ID, isSigner: false, isWritable: false },
        ],
        data: Buffer.concat([disc("refund"), payer.publicKey.toBuffer(), u64(nonceB), u32(0), u8(DECIMALS)]),
      }),
    ],
    [payer],
    "double refund (expect fail)"
  );
} catch {
  doubleFailed = true;
}
assert(doubleFailed, "double refund rejected");
console.log("D2 proof complete");
