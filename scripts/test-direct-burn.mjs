// Definitive test: direct owner burn of a claimed Share via UMI.
// If this closes the account, delegate-burn was the problem and claim
// switches to owner-burn + closed-check. If not, it's a Core/devnet quirk.
import { readFileSync } from "node:fs";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplCore, burnV1 } from "@metaplex-foundation/mpl-core";
import { publicKey as umiPk, keypairIdentity } from "@metaplex-foundation/umi";

const RPC = "https://api.devnet.solana.com";
const TARGET = process.env.BURN_TARGET; // Core asset to burn
if (!TARGET) throw new Error("set BURN_TARGET");

const secret = Uint8Array.from(
  JSON.parse(readFileSync(process.env.CANOPY_PAYER ?? "/home/david/.config/solana/chessonchain-casino-deployer.json", "utf8"))
);
const umi = createUmi(RPC).use(mplCore());
const kp = umi.eddsa.createKeypairFromSecretKey(secret);
umi.use(keypairIdentity(kp));
console.log("owner:", kp.publicKey);

const sig = await burnV1(umi, { asset: umiPk(TARGET) }).sendAndConfirm(umi);
console.log("burn sig:", sig.signature ?? sig);
await new Promise((r) => setTimeout(r, 5000));
const info = await umi.rpc.getAccount(umiPk(TARGET)).catch(() => null);
console.log("exists after direct burn:", info !== null && info.exists !== false);
if (info && info.exists !== false) console.log("lamports:", info.lamports?.basisPoints ?? info.lamports);
