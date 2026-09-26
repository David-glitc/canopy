import {
  Keypair,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { DECIMALS, MUSDC } from "@/lib/canopy-ix";
import { FUTARCHY_ID } from "@/lib/futarchy-read";

const INIT_MARKET = Uint8Array.from(Buffer.from("21fd0f7459197fec", "hex"));

const u64 = (value: bigint | number) => {
  const bytes = new Uint8Array(8);
  new DataView(bytes.buffer).setBigUint64(0, BigInt(value), true);
  return bytes;
};

const i64 = (value: bigint | number) => {
  const bytes = new Uint8Array(8);
  new DataView(bytes.buffer).setBigInt64(0, BigInt(value), true);
  return bytes;
};

const concat = (...parts: Uint8Array[]) => {
  const bytes = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    bytes.set(part, offset);
    offset += part.length;
  }
  return bytes;
};

export const marketPda = (grove: PublicKey, proposalId: bigint) =>
  PublicKey.findProgramAddressSync(
    [Buffer.from("market"), grove.toBuffer(), u64(proposalId)],
    FUTARCHY_ID
  )[0];

const tokenAta = (mint: PublicKey, owner: PublicKey) =>
  getAssociatedTokenAddressSync(mint, owner, true, TOKEN_2022_PROGRAM_ID);

export function buildInitDecisionMarket(args: {
  proposer: PublicKey;
  grove: PublicKey;
  proposalId: bigint;
  bond: bigint;
  seed: bigint;
  opensAt: bigint;
  closesAt: bigint;
}) {
  const { proposer, grove, proposalId, bond, seed, opensAt, closesAt } = args;
  const market = marketPda(grove, proposalId);
  const passMint = Keypair.generate();
  const failMint = Keypair.generate();
  const collateralVault = tokenAta(MUSDC, market);
  const passPool = tokenAta(passMint.publicKey, market);
  const failPool = tokenAta(failMint.publicKey, market);
  const proposerCollateral = tokenAta(MUSDC, proposer);
  const proposerPass = tokenAta(passMint.publicKey, proposer);
  const proposerFail = tokenAta(failMint.publicKey, proposer);

  const instruction = new TransactionInstruction({
    programId: FUTARCHY_ID,
    keys: [
      { pubkey: proposer, isSigner: true, isWritable: true },
      { pubkey: market, isSigner: false, isWritable: true },
      { pubkey: passMint.publicKey, isSigner: true, isWritable: true },
      { pubkey: failMint.publicKey, isSigner: true, isWritable: true },
      { pubkey: collateralVault, isSigner: false, isWritable: true },
      { pubkey: passPool, isSigner: false, isWritable: true },
      { pubkey: failPool, isSigner: false, isWritable: true },
      { pubkey: proposerCollateral, isSigner: false, isWritable: true },
      { pubkey: proposerPass, isSigner: false, isWritable: true },
      { pubkey: proposerFail, isSigner: false, isWritable: true },
      { pubkey: MUSDC, isSigner: false, isWritable: false },
      { pubkey: TOKEN_2022_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: Buffer.from(
      concat(
        INIT_MARKET,
        grove.toBuffer(),
        u64(proposalId),
        u64(bond),
        u64(seed),
        Uint8Array.of(DECIMALS),
        i64(opensAt),
        i64(closesAt)
      )
    ),
  });

  return { instruction, market, passMint, failMint };
}

