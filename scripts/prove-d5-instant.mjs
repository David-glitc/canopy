// D5 proof: init_treasury + instant_mint (solo grove, fee, revealed Share
// in one tx) + verify + claim. Devnet.
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
const encStr = (s) => { const b = Buffer.from(s, "utf8"); const l = Buffer.alloc(4); l.writeUInt32LE(b.length, 0); return Buffer.concat([l, b]); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const payer = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(readFileSync(process.env.CANOPY_PAYER ?? "/home/david/.config/solana/chessonchain-casino-deployer.json", "utf8")))
);
const connection = new Connection(RPC, "confirmed");
const assert = (c, l) => { console.log(c ? `PASS ${l}` : `FAIL ${l}`); if (!c) process.exitCode = 1; };
async function send(ixs, signers, label) {
  for (let a = 0; ; a++) {
    try {
      const sig = await sendAndConfirmTransaction(connection, new Transaction().add(...ixs), signers);
      console.log(`${label}: ${sig}`);
      return sig;
    } catch (e) {
      if (a < 3 && /Blockhash|simulation failed|429/i.test(String(e?.message ?? e))) {
        console.log(`${label}: retry ${a + 1}`);
        await sleep(3000 + a * 2000);
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
const [treasuryPda] = PublicKey.findProgramAddressSync([Buffer.from("treasury")], CANOPY);
const ata = (mint, owner) => getAssociatedTokenAddressSync(mint, owner, true, TOKEN_2022_PROGRAM_ID);
const treasuryVault = ata(MUSDC, treasuryPda);
const payerAta = ata(MUSDC, payer.publicKey);

// init treasury (idempotent: skip if exists)
if (!(await connection.getAccountInfo(treasuryPda))) {
  await send(
    [
      new TransactionInstruction({
        programId: CANOPY,
        keys: [
          { pubkey: payer.publicKey, isSigner: true, isWritable: true },
          { pubkey: treasuryPda, isSigner: false, isWritable: true },
          { pubkey: treasuryVault, isSigner: false, isWritable: true },
          { pubkey: MUSDC, isSigner: false, isWritable: false },
          { pubkey: TOKEN_2022_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: disc("init_treasury"),
      }),
    ],
    [payer],
    "init treasury"
  );
} else {
  console.log("treasury exists, skipping init");
}

// instant mint
const NONCE = 102n;
const AMOUNT = 2_000_000;
const FEE = 20_000;
const NET = 1_980_000;
const grove = PublicKey.findProgramAddressSync(
  [Buffer.from("grove"), payer.publicKey.toBuffer(), u64(NONCE)], CANOPY
)[0];
const vault = ata(MUSDC, grove);
const record = PublicKey.findProgramAddressSync(
  [Buffer.from("share"), grove.toBuffer(), payer.publicKey.toBuffer(), Buffer.from([0, 0, 0, 0])],
  CANOPY
)[0];
const asset = Keypair.generate();
const treasuryBefore = BigInt((await connection.getTokenAccountBalance(treasuryVault).catch(() => ({ value: { amount: "0" } }))).value.amount);
await send(
  [
    ComputeBudgetProgram.setComputeUnitLimit({ units: 600_000 }),
    new TransactionInstruction({
      programId: CANOPY,
      keys: [
        { pubkey: payer.publicKey, isSigner: true, isWritable: true },
        { pubkey: grove, isSigner: false, isWritable: true },
        { pubkey: vault, isSigner: false, isWritable: true },
        { pubkey: treasuryPda, isSigner: false, isWritable: false },
        { pubkey: treasuryVault, isSigner: false, isWritable: true },
        { pubkey: MUSDC, isSigner: false, isWritable: false },
        { pubkey: payerAta, isSigner: false, isWritable: true },
        { pubkey: record, isSigner: false, isWritable: true },
        { pubkey: asset.publicKey, isSigner: true, isWritable: true },
        { pubkey: configPda, isSigner: false, isWritable: false },
        { pubkey: CORE, isSigner: false, isWritable: false },
        { pubkey: TOKEN_2022_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        { pubkey: SLOT_HASHES, isSigner: false, isWritable: false },
      ],
      data: Buffer.concat([
        disc("instant_mint"),
        u64(NONCE),
        u64(AMOUNT),
        Buffer.from([DECIMALS]),
        encStr("Canopy Instant #1"),
        encStr("https://canopy.sol/instant.json"),
      ]),
    }),
  ],
  [payer, asset],
  "instant mint"
);

// verify grove + record
{
  const g = (await getAcct(grove)).data;
  const status = g[148], total = g.readBigUInt64LE(136), count = g.readUInt32LE(144);
  assert(status === 3 && total === BigInt(NET) && count === 1, `solo grove Revealed, funded net (status=${status} total=${total})`);
  const r = (await getAcct(record)).data;
  const weight = r.readBigUInt64LE(117);
  assert(r[116] === 1 && weight === 1_000_000_000_000_000_000n && r[125] === 0, "record 100% revealed active");
}
// verify Core attributes (revealed Legendary + dna + instant)
{
  const umi = createUmi(RPC);
  let t = {};
  for (let i = 0; i < 15; i++) {
    try {
      const a = await fetchAsset(umi, umiPk(asset.publicKey.toBase58()));
      t = Object.fromEntries((a.attributes?.attributeList ?? []).map((x) => [x.key, x.value]));
      if (t.revealed === "true" && t.dna) break;
    } catch {}
    await sleep(3000);
  }
  assert(t.revealed === "true" && t.rarity === "Legendary" && t.instant === "true", "instant Share revealed Legendary");
  assert(BigInt(t.weight_1e18) === 1_000_000_000_000_000_000n && BigInt(t.dna) > 0n, "weight 1e18 + dna seed");
  console.log("dna:", t.dna);
}
// verify fee landed
{
  const after = BigInt((await connection.getTokenAccountBalance(treasuryVault)).value.amount);
  assert(after - treasuryBefore === BigInt(FEE), `treasury fee 1% (delta=${after - treasuryBefore})`);
}
// claim it (standard claim path proves instant Shares are live)
{
  const before = BigInt((await connection.getTokenAccountBalance(payerAta)).value.amount);
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
          { pubkey: record, isSigner: false, isWritable: true },
          { pubkey: asset.publicKey, isSigner: false, isWritable: true },
          { pubkey: configPda, isSigner: false, isWritable: false },
          { pubkey: CORE, isSigner: false, isWritable: false },
          { pubkey: TOKEN_2022_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: Buffer.concat([
          disc("claim"),
          payer.publicKey.toBuffer(),
          u64(NONCE),
          u32(0),
          Buffer.from([DECIMALS]),
        ]),
      }),
    ],
    [payer],
    "claim instant"
  );
  const after = BigInt((await connection.getTokenAccountBalance(payerAta)).value.amount);
  assert(after - before === BigInt(NET), `instant claim paid net (delta=${after - before})`);
}
console.log("D5 proof complete");
