// One-off: fund the faucet wallet (SOL for fees + mUSDC to drip).
// Usage: FAUCET=<pubkey> node fund-faucet.mjs
import { readFileSync } from "node:fs";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createMintToCheckedInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";

const MUSDC = new PublicKey("3PN7iGUrNyk6AgGkGRGx5mD9ftGRGWNJC3FRFkRRhLC5");
const RPC = "https://api.devnet.solana.com";
const faucet = new PublicKey(process.env.FAUCET);
if (!faucet) throw new Error("set FAUCET=<pubkey>");

const payer = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(readFileSync(process.env.CANOPY_PAYER ?? "/home/david/.config/solana/chessonchain-casino-deployer.json", "utf8")))
);
const connection = new Connection(RPC, "confirmed");
const faucetAta = getAssociatedTokenAddressSync(MUSDC, faucet, true, TOKEN_2022_PROGRAM_ID);

await sendAndConfirmTransaction(
  connection,
  new Transaction().add(
    SystemProgram.transfer({ fromPubkey: payer.publicKey, toPubkey: faucet, lamports: 2 * LAMPORTS_PER_SOL })
  ),
  [payer]
);
console.log("faucet SOL funded");
await sendAndConfirmTransaction(
  connection,
  new Transaction().add(
    createAssociatedTokenAccountInstruction(payer.publicKey, faucetAta, faucet, MUSDC, TOKEN_2022_PROGRAM_ID)
  ),
  [payer]
);
console.log("faucet ATA:", faucetAta.toBase58());
await sendAndConfirmTransaction(
  connection,
  new Transaction().add(
    createMintToCheckedInstruction(MUSDC, faucetAta, payer.publicKey, 1_000_000_000_000, 6, [], TOKEN_2022_PROGRAM_ID)
  ),
  [payer]
);
console.log("faucet mUSDC funded (1M)");
