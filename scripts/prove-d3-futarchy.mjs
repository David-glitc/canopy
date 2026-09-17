// D3 proof: futarchy decision markets on devnet.
// Market 1: bond+seed -> split -> swap (bet PASS) -> TWAP -> finalize PASS -> redeem.
// Market 2: bond+seed, zero trades -> finalize -> status quo (FAILED).
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  ComputeBudgetProgram,
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

const FUT = new PublicKey("BP4hBGTDh2a3Rq1jarE2CQUUpBJcdr5a2KWnwP9qu68k");
const MUSDC = new PublicKey("3PN7iGUrNyk6AgGkGRGx5mD9ftGRGWNJC3FRFkRRhLC5");
const RPC = "https://api.devnet.solana.com";
const DECIMALS = 6;

const disc = (n) => createHash("sha256").update(`global:${n}`).digest().subarray(0, 8);
const u64 = (n) => { const b = Buffer.alloc(8); b.writeBigUInt64LE(BigInt(n), 0); return b; };
const i64 = (n) => { const b = Buffer.alloc(8); b.writeBigInt64LE(BigInt(n), 0); return b; };
const u8 = (n) => Buffer.from([n]);
const encStr = (s) => { const b = Buffer.from(s, "utf8"); const l = Buffer.alloc(4); l.writeUInt32LE(b.length, 0); return Buffer.concat([l, b]); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const payer = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(readFileSync(process.env.CANOPY_PAYER ?? "/home/david/.config/solana/chessonchain-casino-deployer.json", "utf8")))
);
const connection = new Connection(RPC, "confirmed");
const assert = (c, l) => { console.log(c ? `PASS ${l}` : `FAIL ${l}`); if (!c) process.exitCode = 1; };

async function send(ixs, signers, label) {
  const sig = await sendAndConfirmTransaction(connection, new Transaction().add(...ixs), signers);
  console.log(`${label}: ${sig}`);
  return sig;
}
async function getAcct(pubkey) {
  for (let i = 0; i < 15; i++) {
    try { const a = await connection.getAccountInfo(pubkey); if (a) return a; } catch {}
    await sleep(2000 + i * 1000);
  }
  throw new Error("getAccountInfo failed");
}
// Market layout: disc8 grove32 pid8 cmint32 vault32 pmint32 fmint32 ppool32 fpool32 opens8 closes8 decided1 passed1 pres8 fres8 cum16 crank8 trades8 bump1
function parseMarket(buf) {
  const o = 8 + 32 + 8 + 32 + 32 + 32 + 32 + 32 + 32 + 8 + 8;
  return { decided: buf[o] === 1, passed: buf[o + 1] === 1 };
}
async function tokenBalance(ata) {
  for (let i = 0; i < 10; i++) {
    try { const v = await connection.getTokenAccountBalance(ata); if (v) return BigInt(v.value.amount); } catch {}
    await sleep(2000);
  }
  return 0n;
}

const marketPda = (grove, pid) =>
  PublicKey.findProgramAddressSync(
    [Buffer.from("market"), grove.toBuffer(), u64(pid)],
    FUT
  )[0];
const ata = (mint, owner) =>
  getAssociatedTokenAddressSync(mint, owner, true, TOKEN_2022_PROGRAM_ID);

// Grove ref: D2 Grove A (nonce 5) PDA. Market does not validate it (sidecar).
const groveA = PublicKey.findProgramAddressSync(
  [Buffer.from("grove"), payer.publicKey.toBuffer(), u64(5n)],
  new PublicKey("9xmniHhMGswjyMGf9jW7YCireJaUARBozRSDWYU1Jrnf")
)[0];

console.log("payer:", payer.publicKey.toBase58());
// trader
const bob = Keypair.generate();
await send(
  [SystemProgram.transfer({ fromPubkey: payer.publicKey, toPubkey: bob.publicKey, lamports: 0.1 * LAMPORTS_PER_SOL })],
  [payer],
  "fund bob SOL"
);
const bobUsdc = ata(MUSDC, bob.publicKey);
await send(
  [createAssociatedTokenAccountInstruction(payer.publicKey, bobUsdc, bob.publicKey, MUSDC, TOKEN_2022_PROGRAM_ID)],
  [payer],
  "bob usdc ata"
);
await send(
  [createTransferCheckedInstruction(ata(MUSDC, payer.publicKey), MUSDC, bobUsdc, payer.publicKey, 2_000_000, DECIMALS, [], TOKEN_2022_PROGRAM_ID)],
  [payer],
  "fund bob 2 mUSDC"
);

async function initMarket(pid, bond, seed, windowSec) {
  const market = marketPda(groveA, pid);
  const passMint = Keypair.generate();
  const failMint = Keypair.generate();
  const vault = ata(MUSDC, market);
  const passPool = ata(passMint.publicKey, market);
  const failPool = ata(failMint.publicKey, market);
  const payerUsdc = ata(MUSDC, payer.publicKey);
  const payerPass = ata(passMint.publicKey, payer.publicKey);
  const payerFail = ata(failMint.publicKey, payer.publicKey);
  const now = Math.floor(Date.now() / 1000);
  const data = Buffer.concat([
    disc("init_market"),
    groveA.toBuffer(),
    u64(pid),
    u64(bond),
    u64(seed),
    u8(DECIMALS),
    i64(now),
    i64(now + windowSec),
  ]);
  await send(
    [
      ComputeBudgetProgram.setComputeUnitLimit({ units: 600_000 }),
      new TransactionInstruction({
        programId: FUT,
        keys: [
          { pubkey: payer.publicKey, isSigner: true, isWritable: true },
          { pubkey: market, isSigner: false, isWritable: true },
          { pubkey: passMint.publicKey, isSigner: true, isWritable: true },
          { pubkey: failMint.publicKey, isSigner: true, isWritable: true },
          { pubkey: vault, isSigner: false, isWritable: true },
          { pubkey: passPool, isSigner: false, isWritable: true },
          { pubkey: failPool, isSigner: false, isWritable: true },
          { pubkey: payerUsdc, isSigner: false, isWritable: true },
          { pubkey: payerPass, isSigner: false, isWritable: true },
          { pubkey: payerFail, isSigner: false, isWritable: true },
          { pubkey: MUSDC, isSigner: false, isWritable: false },
          { pubkey: TOKEN_2022_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data,
      }),
    ],
    [payer, passMint, failMint],
    `init market ${pid}`
  );
  return { market, passMint: passMint.publicKey, failMint: failMint.publicKey, vault, passPool, failPool };
}

// ---------- Market 1: trade -> PASS wins ----------
const m1 = await initMarket(1n, 2_000_000, 1_000_000, 75);
// bob outcome ATAs
const bobPass = ata(m1.passMint, bob.publicKey);
const bobFail = ata(m1.failMint, bob.publicKey);
await send(
  [
    createAssociatedTokenAccountInstruction(bob.publicKey, bobPass, bob.publicKey, m1.passMint, TOKEN_2022_PROGRAM_ID),
    createAssociatedTokenAccountInstruction(bob.publicKey, bobFail, bob.publicKey, m1.failMint, TOKEN_2022_PROGRAM_ID),
  ],
  [bob],
  "bob outcome atas"
);
// split 0.5 mUSDC
await send(
  [
    new TransactionInstruction({
      programId: FUT,
      keys: [
        { pubkey: bob.publicKey, isSigner: true, isWritable: false },
        { pubkey: m1.market, isSigner: false, isWritable: false },
        { pubkey: m1.vault, isSigner: false, isWritable: true },
        { pubkey: bobUsdc, isSigner: false, isWritable: true },
        { pubkey: bobPass, isSigner: false, isWritable: true },
        { pubkey: bobFail, isSigner: false, isWritable: true },
        { pubkey: m1.passMint, isSigner: false, isWritable: true },
        { pubkey: m1.failMint, isSigner: false, isWritable: true },
        { pubkey: MUSDC, isSigner: false, isWritable: false },
        { pubkey: TOKEN_2022_PROGRAM_ID, isSigner: false, isWritable: false },
      ],
      data: Buffer.concat([disc("split"), groveA.toBuffer(), u64(1n), u64(500_000), u8(DECIMALS)]),
    }),
  ],
  [bob],
  "split 0.5"
);
// swap 0.3 FAIL -> PASS (bet PASS)
{
  // CPMM estimate: out = 1M * 0.3M*0.997 / (1M + 0.3M*0.997) ≈ 230k; min 200k
  const data = Buffer.concat([
    disc("swap"),
    groveA.toBuffer(),
    u64(1n),
    u64(300_000),
    u8(0), // is_pass_to_fail = false
    u64(200_000),
    u8(DECIMALS),
  ]);
  await send(
    [
      new TransactionInstruction({
        programId: FUT,
        keys: [
          { pubkey: bob.publicKey, isSigner: true, isWritable: false },
          { pubkey: m1.market, isSigner: false, isWritable: true },
          { pubkey: m1.failPool, isSigner: false, isWritable: true },
          { pubkey: m1.passPool, isSigner: false, isWritable: true },
          { pubkey: bobFail, isSigner: false, isWritable: true },
          { pubkey: bobPass, isSigner: false, isWritable: true },
          { pubkey: m1.passMint, isSigner: false, isWritable: false },
          { pubkey: m1.failMint, isSigner: false, isWritable: false },
          { pubkey: TOKEN_2022_PROGRAM_ID, isSigner: false, isWritable: false },
        ],
        data,
      }),
    ],
    [bob],
    "swap FAIL->PASS"
  );
}
console.log("waiting for market 1 close (~80s)...");
await sleep(85000);
await send(
  [
    new TransactionInstruction({
      programId: FUT,
      keys: [
        { pubkey: payer.publicKey, isSigner: true, isWritable: false },
        { pubkey: m1.market, isSigner: false, isWritable: true },
      ],
      data: Buffer.concat([disc("finalize"), groveA.toBuffer(), u64(1n)]),
    }),
  ],
  [payer],
  "finalize market 1"
);
{
  const m = parseMarket((await getAcct(m1.market)).data);
  assert(m.decided && m.passed, "market 1 decided PASS");
}
// redeem bob's PASS (split 0.5M + bought ~0.23M)
{
  const bal = await tokenBalance(bobPass);
  console.log("bob PASS balance:", bal.toString());
  const before = await tokenBalance(bobUsdc);
  await send(
    [
      new TransactionInstruction({
        programId: FUT,
        keys: [
          { pubkey: bob.publicKey, isSigner: true, isWritable: false },
          { pubkey: m1.market, isSigner: false, isWritable: false },
          { pubkey: m1.vault, isSigner: false, isWritable: true },
          { pubkey: bobUsdc, isSigner: false, isWritable: true },
          { pubkey: bobPass, isSigner: false, isWritable: true },
          { pubkey: m1.passMint, isSigner: false, isWritable: true },
          { pubkey: MUSDC, isSigner: false, isWritable: false },
          { pubkey: TOKEN_2022_PROGRAM_ID, isSigner: false, isWritable: false },
        ],
        data: Buffer.concat([disc("redeem"), groveA.toBuffer(), u64(1n), u64(bal), u8(DECIMALS)]),
      }),
    ],
    [bob],
    "redeem PASS"
  );
  const after = await tokenBalance(bobUsdc);
  assert(after - before === bal, `redeem paid 1:1 (delta=${after - before})`);
}

// ---------- Market 2: silence -> status quo ----------
const m2 = await initMarket(2n, 1_000_000, 500_000, 50);
console.log("waiting for market 2 close (~55s), no trades...");
await sleep(60000);
await send(
  [
    new TransactionInstruction({
      programId: FUT,
      keys: [
        { pubkey: payer.publicKey, isSigner: true, isWritable: false },
        { pubkey: m2.market, isSigner: false, isWritable: true },
      ],
      data: Buffer.concat([disc("finalize"), groveA.toBuffer(), u64(2n)]),
    }),
  ],
  [payer],
  "finalize market 2"
);
{
  const m = parseMarket((await getAcct(m2.market)).data);
  assert(m.decided && !m.passed, "market 2 status quo (FAILED, no trades)");
}
console.log("D3 proof complete");
