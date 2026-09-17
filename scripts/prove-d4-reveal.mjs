// D4 proof: commit -> reveal (slot-hash entropy, weights sum 1e18, Core
// attributes flipped) -> claim x2 (burn + pro-rata payout) on devnet.
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
} from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { fetchAsset } from "@metaplex-foundation/mpl-core";
import { publicKey as umiPk } from "@metaplex-foundation/umi";

const CANOPY = new PublicKey("9xmniHhMGswjyMGf9jW7YCireJaUARBozRSDWYU1Jrnf");
const CORE = new PublicKey("CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d");
const MUSDC = new PublicKey("3PN7iGUrNyk6AgGkGRGx5mD9ftGRGWNJC3FRFkRRhLC5");
const SLOT_HASHES = new PublicKey("SysvarS1otHashes111111111111111111111111111");
const RPC = "https://api.devnet.solana.com";
const DECIMALS = 6;

const disc = (n) => createHash("sha256").update(`global:${n}`).digest().subarray(0, 8);
const u64 = (n) => { const b = Buffer.alloc(8); b.writeBigUInt64LE(BigInt(n), 0); return b; };
const u32 = (n) => { const b = Buffer.alloc(4); b.writeUInt32LE(n, 0); return b; };
const i64 = (n) => { const b = Buffer.alloc(8); b.writeBigInt64LE(BigInt(n), 0); return b; };
const encStr = (s) => { const b = Buffer.from(s, "utf8"); const l = Buffer.alloc(4); l.writeUInt32LE(b.length, 0); return Buffer.concat([l, b]); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const payer = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(readFileSync(process.env.CANOPY_PAYER ?? "/home/david/.config/solana/chessonchain-casino-deployer.json", "utf8")))
);
const connection = new Connection(RPC, "confirmed");
const assert = (c, l) => { console.log(c ? `PASS ${l}` : `FAIL ${l}`); if (!c) process.exitCode = 1; };
async function send(ixs, signers, label) {
  for (let attempt = 0; ; attempt++) {
    try {
      const sig = await sendAndConfirmTransaction(connection, new Transaction().add(...ixs), signers);
      console.log(`${label}: ${sig}`);
      return sig;
    } catch (e) {
      const msg = String(e?.message ?? e);
      if (attempt < 3 && /Blockhash|simulation failed|429|Too Many/i.test(msg)) {
        console.log(`${label}: retry ${attempt + 1}`);
        await sleep(3000 + attempt * 2000);
        continue;
      }
      throw e;
    }
  }
}
async function getAcct(pubkey) {
  for (let i = 0; i < 15; i++) {
    try { const a = await connection.getAccountInfo(pubkey); if (a) return a; } catch {}
    await sleep(2000 + i * 1000);
  }
  throw new Error("getAccountInfo failed");
}

const [configPda] = PublicKey.findProgramAddressSync([Buffer.from("config")], CANOPY);
const grovePda = (creator, nonce) =>
  PublicKey.findProgramAddressSync([Buffer.from("grove"), creator.toBuffer(), u64(nonce)], CANOPY)[0];
const recordPda = (grove, owner, index) =>
  PublicKey.findProgramAddressSync(
    [Buffer.from("share"), grove.toBuffer(), owner.toBuffer(), u32(index)], CANOPY
  )[0];
const revealPda = (grove) =>
  PublicKey.findProgramAddressSync([Buffer.from("reveal"), grove.toBuffer()], CANOPY)[0];
const ata = (mint, owner) =>
  getAssociatedTokenAddressSync(mint, owner, true, TOKEN_2022_PROGRAM_ID);

// Record layout: disc8 grove32 owner32 deposit8 asset32 index4 revealed1 weight8 status1 bump1
function parseRecord(buf) {
  return {
    revealed: buf[116] === 1,
    weight: buf.readBigUInt64LE(117),
    status: buf[125],
  };
}

const NONCE = 10n;
const grove = grovePda(payer.publicKey, NONCE);
const vault = ata(MUSDC, grove);
const payerAta = ata(MUSDC, payer.publicKey);
const now = Math.floor(Date.now() / 1000);

// create
await send(
  [
    new TransactionInstruction({
      programId: CANOPY,
      keys: [
        { pubkey: payer.publicKey, isSigner: true, isWritable: true },
        { pubkey: grove, isSigner: false, isWritable: true },
        { pubkey: vault, isSigner: false, isWritable: true },
        { pubkey: MUSDC, isSigner: false, isWritable: false },
        { pubkey: TOKEN_2022_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: Buffer.concat([disc("create_grove"), u64(NONCE), u64(2_000_000), i64(now + 86400), u64(500_000)]),
    }),
  ],
  [payer],
  "create grove C"
);

// deposits (payer x2, different amounts -> different weights)
const assets = [Keypair.generate(), Keypair.generate()];
const amounts = [1_500_000, 1_000_000];
for (let i = 0; i < 2; i++) {
  const record = recordPda(grove, payer.publicKey, i);
  await send(
    [
      new TransactionInstruction({
        programId: CANOPY,
        keys: [
          { pubkey: payer.publicKey, isSigner: true, isWritable: true },
          { pubkey: grove, isSigner: false, isWritable: true },
          { pubkey: vault, isSigner: false, isWritable: true },
          { pubkey: payerAta, isSigner: false, isWritable: true },
          { pubkey: MUSDC, isSigner: false, isWritable: false },
          { pubkey: record, isSigner: false, isWritable: true },
          { pubkey: assets[i].publicKey, isSigner: true, isWritable: true },
          { pubkey: configPda, isSigner: false, isWritable: false },
          { pubkey: CORE, isSigner: false, isWritable: false },
          { pubkey: TOKEN_2022_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: Buffer.concat([
          disc("deposit"),
          payer.publicKey.toBuffer(),
          u64(NONCE),
          u32(i),
          u64(amounts[i]),
          Buffer.from([DECIMALS]),
          encStr(`Canopy Share C-${i}`),
          encStr("https://canopy.sol/share.json"),
        ]),
      }),
    ],
    [payer, assets[i]],
    `deposit C-${i}`
  );
}

// close
await send(
  [
    new TransactionInstruction({
      programId: CANOPY,
      keys: [{ pubkey: grove, isSigner: false, isWritable: true }],
      data: Buffer.concat([disc("close_grove"), payer.publicKey.toBuffer(), u64(NONCE)]),
    }),
  ],
  [payer],
  "close grove C"
);

// commit
const revealState = revealPda(grove);
await send(
  [
    new TransactionInstruction({
      programId: CANOPY,
      keys: [
        { pubkey: grove, isSigner: false, isWritable: false },
        { pubkey: revealState, isSigner: false, isWritable: true },
        { pubkey: payer.publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: Buffer.concat([disc("commit_reveal"), payer.publicKey.toBuffer(), u64(NONCE)]),
    }),
  ],
  [payer],
  "commit reveal"
);

console.log("waiting ~25s for entropy slot...");
await sleep(25000);

// reveal (struct: grove, reveal_state; remaining: core, config, keeper,
// system, slothashes, rec0, asset0, rec1, asset1)
const recs = [recordPda(grove, payer.publicKey, 0), recordPda(grove, payer.publicKey, 1)];
await send(
  [
    ComputeBudgetProgram.setComputeUnitLimit({ units: 600_000 }),
    new TransactionInstruction({
      programId: CANOPY,
      keys: [
        { pubkey: grove, isSigner: false, isWritable: true },
        { pubkey: revealState, isSigner: false, isWritable: true },
        { pubkey: CORE, isSigner: false, isWritable: false },
        { pubkey: configPda, isSigner: false, isWritable: false },
        { pubkey: payer.publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        { pubkey: SLOT_HASHES, isSigner: false, isWritable: false },
        { pubkey: recs[0], isSigner: false, isWritable: true },
        { pubkey: assets[0].publicKey, isSigner: false, isWritable: true },
        { pubkey: recs[1], isSigner: false, isWritable: true },
        { pubkey: assets[1].publicKey, isSigner: false, isWritable: true },
      ],
      data: Buffer.concat([disc("reveal"), payer.publicKey.toBuffer(), u64(NONCE)]),
    }),
  ],
  [payer],
  "reveal"
);

// verify records + grove
const TOTAL = 2_500_000n;
const parsed = [];
for (let i = 0; i < 2; i++) {
  const r = parseRecord((await getAcct(recs[i])).data);
  parsed.push(r);
  console.log(`share ${i}: weight=${r.weight} revealed=${r.revealed} status=${r.status}`);
}
const sum = parsed[0].weight + parsed[1].weight;
assert(parsed.every((r) => r.revealed && r.status === 0 && r.weight > 0n), "records revealed, active, floored");
assert(sum === 1_000_000_000_000_000_000n, `weights sum to 1e18 (sum=${sum})`);
assert(parsed[0].weight !== parsed[1].weight, "weights differ by deposit/asset");
{
  const g = (await getAcct(grove)).data;
  assert(g[148] === 3, "grove Revealed");
}
// verify Core attributes flipped (retry: devnet RPC can serve stale reads)
{
  const umi = createUmi(RPC);
  for (let i = 0; i < 2; i++) {
    let t = {};
    for (let r = 0; r < 12; r++) {
      const a = await fetchAsset(umi, umiPk(assets[i].publicKey.toBase58()));
      t = Object.fromEntries((a.attributes?.attributeList ?? []).map((x) => [x.key, x.value]));
      if (t.revealed === "true" && t.weight_1e18) break;
      await sleep(3000);
    }
    assert(t.sealed === "false" && t.revealed === "true", `share ${i} attributes flipped`);
    assert(BigInt(t.weight_1e18) === parsed[i].weight, `share ${i} on-chain weight matches`);
    console.log(`share ${i} rarity: ${t.rarity}`);
  }
}

// claim both (payout = weight * total / 1e18, pro-rata of quote vault)
for (let i = 0; i < 2; i++) {
  const expected = (parsed[i].weight * TOTAL) / 1_000_000_000_000_000_000n;
  const before = (await connection.getTokenAccountBalance(payerAta)).value.amount;
  await send(
    [
      new TransactionInstruction({
        programId: CANOPY,
        keys: [
          { pubkey: payer.publicKey, isSigner: true, isWritable: true },
          { pubkey: grove, isSigner: false, isWritable: false },
          { pubkey: vault, isSigner: false, isWritable: true },
          { pubkey: payerAta, isSigner: false, isWritable: true },
          { pubkey: MUSDC, isSigner: false, isWritable: false },
          { pubkey: recs[i], isSigner: false, isWritable: true },
          { pubkey: assets[i].publicKey, isSigner: false, isWritable: true },
          { pubkey: configPda, isSigner: false, isWritable: false },
          { pubkey: CORE, isSigner: false, isWritable: false },
          { pubkey: TOKEN_2022_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: Buffer.concat([
          disc("claim"),
          payer.publicKey.toBuffer(),
          u64(NONCE),
          u32(i),
          Buffer.from([DECIMALS]),
        ]),
      }),
    ],
    [payer],
    `claim C-${i}`
  );
  const after = (await connection.getTokenAccountBalance(payerAta)).value.amount;
  const delta = BigInt(after) - BigInt(before);
  assert(delta === expected, `claim ${i} paid pro-rata (delta=${delta} expected=${expected})`);
  const umi2 = createUmi(RPC);
  let ct = {};
  for (let r = 0; r < 12; r++) {
    const ca = await fetchAsset(umi2, umiPk(assets[i].publicKey.toBase58()));
    ct = Object.fromEntries((ca.attributes?.attributeList ?? []).map((x) => [x.key, x.value]));
    if (ct.claimed === "true") break;
    await sleep(3000);
  }
  assert(ct.claimed === "true", `share ${i} shell marked claimed`);
  const r = parseRecord((await getAcct(recs[i])).data);
  assert(r.status === 2, `share ${i} record Claimed`);
}
console.log("D4 proof complete");
