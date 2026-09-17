import { NextRequest, NextResponse } from "next/server";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";

export const runtime = "nodejs";

const RPC = "https://api.devnet.solana.com";
const MUSDC = new PublicKey("3PN7iGUrNyk6AgGkGRGx5mD9ftGRGWNJC3FRFkRRhLC5");
const DRIP_USDC = 10_000_000; // $10
const DRIP_SOL = 50_000_000; // 0.05
const COOLDOWN_MS = 10 * 60 * 1000;

const seen = new Map<string, number>();

function faucetKey(): Keypair | null {
  const raw = process.env.FAUCET_KEY_JSON;
  if (!raw) return null;
  try {
    return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(raw)));
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const faucet = faucetKey();
  if (!faucet) {
    return NextResponse.json({ error: "faucet not configured" }, { status: 503 });
  }
  let address: string;
  try {
    ({ address } = await req.json());
    new PublicKey(address);
  } catch {
    return NextResponse.json({ error: "bad address" }, { status: 400 });
  }
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const key = `${ip}:${address}`;
  const last = seen.get(key) ?? 0;
  if (Date.now() - last < COOLDOWN_MS) {
    return NextResponse.json({ error: "cooldown: try again in a few minutes" }, { status: 429 });
  }
  seen.set(key, Date.now());

  try {
    const connection = new Connection(RPC, "confirmed");
    const to = new PublicKey(address);
    const toAta = getAssociatedTokenAddressSync(MUSDC, to, true, TOKEN_2022_PROGRAM_ID);
    const fromAta = getAssociatedTokenAddressSync(MUSDC, faucet.publicKey, true, TOKEN_2022_PROGRAM_ID);
    const ixs = [];
    if ((await connection.getAccountInfo(toAta)) === null) {
      ixs.push(
        createAssociatedTokenAccountInstruction(
          faucet.publicKey,
          toAta,
          to,
          MUSDC,
          TOKEN_2022_PROGRAM_ID
        )
      );
    }
    ixs.push(
      createTransferCheckedInstruction(
        fromAta,
        MUSDC,
        toAta,
        faucet.publicKey,
        DRIP_USDC,
        6,
        [],
        TOKEN_2022_PROGRAM_ID
      )
    );
    ixs.push(
      SystemProgram.transfer({ fromPubkey: faucet.publicKey, toPubkey: to, lamports: DRIP_SOL })
    );
    const sig = await sendAndConfirmTransaction(
      connection,
      new Transaction().add(...ixs),
      [faucet]
    );
    return NextResponse.json({ ok: true, sig, musdc: DRIP_USDC / 1e6, sol: DRIP_SOL / 1e9 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message.slice(0, 200) : "faucet failed" },
      { status: 500 }
    );
  }
}
