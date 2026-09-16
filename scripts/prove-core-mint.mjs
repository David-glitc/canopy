// D1 proof: our devnet `canopy` program mints a Metaplex Core Share via CPI,
// with the program PDA as update authority + plugin authority. Then we read
// the asset back and assert sealed attributes, royalty, freeze + burn delegates.
//
// Set SHARE_ADDR to verify an existing Share without minting a new one.
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
} from "@solana/web3.js";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { fetchAsset } from "@metaplex-foundation/mpl-core";
import { publicKey as umiPk } from "@metaplex-foundation/umi";

const CANOPY = new PublicKey("9xmniHhMGswjyMGf9jW7YCireJaUARBozRSDWYU1Jrnf");
const CORE = new PublicKey("CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d");
const RPC = "https://api.devnet.solana.com";
const sj = (o) => JSON.stringify(o, (_, v) => (typeof v === "bigint" ? v.toString() : v));

const disc = (name) =>
  createHash("sha256").update(`global:${name}`).digest().subarray(0, 8);

const encStr = (s) => {
  const b = Buffer.from(s, "utf8");
  const len = Buffer.alloc(4);
  len.writeUInt32LE(b.length, 0);
  return Buffer.concat([len, b]);
};
const encU64 = (n) => {
  const b = Buffer.alloc(8);
  b.writeBigUInt64LE(BigInt(n), 0);
  return b;
};

const payerPath =
  process.env.CANOPY_PAYER ?? "/home/david/.config/solana/chessonchain-casino-deployer.json";
const payer = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(readFileSync(payerPath, "utf8")))
);

const connection = new Connection(RPC, "confirmed");
const [configPda] = PublicKey.findProgramAddressSync(
  [Buffer.from("config")],
  CANOPY
);

console.log("payer:", payer.publicKey.toBase58());
console.log("config PDA:", configPda.toBase58());

let assetPubkey;
if (process.env.SHARE_ADDR) {
  assetPubkey = new PublicKey(process.env.SHARE_ADDR);
  console.log("verify-only mode for:", assetPubkey.toBase58());
} else {
  // 1. initialize config if missing
  const cfgInfo = await connection.getAccountInfo(configPda);
  if (!cfgInfo) {
    console.log("initializing config...");
    const ix = new TransactionInstruction({
      programId: CANOPY,
      keys: [
        { pubkey: configPda, isSigner: false, isWritable: true },
        { pubkey: payer.publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: disc("initialize"),
    });
    const sig = await sendAndConfirmTransaction(
      connection,
      new Transaction().add(ix),
      [payer]
    );
    console.log("initialize:", sig);
  } else {
    console.log("config exists, skipping initialize");
  }

  // 2. mint a sealed Share
  const asset = Keypair.generate();
  const name = "Canopy Share #1";
  const uri = "https://canopy.sol/share/1.json";
  const depositLamports = 1_500_000n;
  const data = Buffer.concat([
    disc("mint_share"),
    encStr(name),
    encStr(uri),
    encU64(depositLamports),
  ]);
  const mintIx = new TransactionInstruction({
    programId: CANOPY,
    keys: [
      { pubkey: payer.publicKey, isSigner: true, isWritable: true },
      { pubkey: asset.publicKey, isSigner: true, isWritable: true },
      { pubkey: configPda, isSigner: false, isWritable: false },
      { pubkey: CORE, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  });
  console.log("minting Share:", asset.publicKey.toBase58());
  const mintSig = await sendAndConfirmTransaction(
    connection,
    new Transaction().add(mintIx),
    [payer, asset]
  );
  console.log("mint_share:", mintSig);
  assetPubkey = asset.publicKey;
}

// 3. read back via Core and assert (retry: devnet RPC can lag confirmation)
const umi = createUmi(RPC);
let share = null;
for (let i = 0; i < 10 && !share; i++) {
  try {
    share = await fetchAsset(umi, umiPk(assetPubkey.toBase58()));
  } catch (e) {
    if (i === 9) throw e;
    await new Promise((r) => setTimeout(r, 3000));
  }
}
console.log("--- onchain Share ---");
console.log("owner:", share.owner);
console.log("updateAuthority:", share.updateAuthority?.type, share.updateAuthority?.address ?? "");
console.log("name:", share.name, "| uri:", share.uri);

const attrs = share.attributes?.attributeList ?? [];
const get = (k) => attrs.find((a) => a.key === k)?.value;
console.log("attributes:", sj(attrs));
console.log("royalties bps:", share.royalties?.basisPoints);
console.log("freezeDelegate:", sj(share.freezeDelegate));
console.log("burnDelegate:", share.burnDelegate ? "present" : "MISSING");

const assert = (cond, label) => {
  console.log(cond ? `PASS ${label}` : `FAIL ${label}`);
  if (!cond) process.exitCode = 1;
};
assert(share.owner === payer.publicKey.toBase58(), "owner == payer");
assert(
  String(share.updateAuthority?.address ?? share.updateAuthority) ===
    configPda.toBase58(),
  "updateAuthority == config PDA"
);
assert(get("sealed") === "true", "sealed == true");
assert(
  get("deposit_lamports") === "1500000",
  "deposit recorded"
);
assert(share.royalties?.basisPoints === 250, "royalty 250bps");
assert(!!share.freezeDelegate, "freeze delegate present");
assert(!!share.burnDelegate, "burn delegate present");
console.log(
  `explorer: https://explorer.solana.com/address/${assetPubkey.toBase58()}?cluster=devnet`
);
