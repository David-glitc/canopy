"use client";

import { useMemo, useState } from "react";
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  ComputeBudgetProgram,
} from "@solana/web3.js";
import { useConnection } from "@solana/wallet-adapter-react";
import { useUnifiedWallet } from "@/lib/useUnifiedWallet";
import {
  MUSDC,
  ata,
  buildClaim,
  buildInstantMint,
  grovePda,
  recordPda,
} from "@/lib/canopy-ix";
import Rip from "./Rip";
import { cn } from "@/lib/utils";

type Minted = {
  asset: string;
  grove: string;
  nonce: bigint;
  amount: number;
  imageUrl: string;
  metaUrl: string;
  shareUrl: string;
  weight: string;
};

type SelectedAsset = { symbol: string; contract: string; tokenPrice?: number };

export default function InstantMint({ asset }: { asset?: SelectedAsset }) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected } = useUnifiedWallet();
  const [usd, setUsd] = useState("2.00");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [minted, setMinted] = useState<Minted | null>(null);
  const [claimed, setClaimed] = useState(false);

  const lamports = useMemo(() => {
    const v = Math.round(parseFloat(usd || "0") * 1e6);
    return Number.isFinite(v) ? v : 0;
  }, [usd]);
  const fee = Math.floor(lamports * 0.01);
  const net = lamports - fee;
  const valid = lamports >= 1_500_000;

  async function mint() {
    if (!publicKey) {
      setError("No wallet connected — connect Phantom or Backpack to mint.");
      return;
    }
    if (!valid) {
      setError("Amount must be at least $1.50.");
      return;
    }
    setError(null);
    setBusy("Minting…");
    try {
      const nonce = BigInt(Date.now() % 100000) * 1000n + BigInt(Math.floor(Math.random() * 1000));
      const grove = grovePda(publicKey, nonce);
      const record = recordPda(grove, publicKey, 0);
      const assetKey = Keypair.generate();
      const origin = window.location.origin;
      const metadataQuery = new URLSearchParams();
      if (asset) {
        metadataQuery.set("asset", asset.symbol);
        metadataQuery.set("contract", asset.contract);
        if (asset.tokenPrice != null) metadataQuery.set("price", asset.tokenPrice.toFixed(6));
      }
      const suffix = metadataQuery.size ? `?${metadataQuery}` : "";
      const uri = `${origin}/api/cards/${assetKey.publicKey.toBase58()}/metadata${suffix}`;
      const ix = buildInstantMint({
        payer: publicKey,
        nonce,
        amount: BigInt(lamports),
        name: asset ? `Canopy ${asset.symbol} Claim` : "Canopy Instant",
        uri: uri.slice(0, 200),
        grove,
        vault: ata(MUSDC, grove),
        record,
        asset: assetKey.publicKey,
      });
      const tx = new Transaction().add(
        ComputeBudgetProgram.setComputeUnitLimit({ units: 600_000 }),
        ix
      );
      const sig = await sendTransaction(tx, connection, { signers: [assetKey] });
      await connection.confirmTransaction(sig, "confirmed");

      const info = await connection.getAccountInfo(record);
      const weight = info
        ? new DataView(info.data.buffer, info.data.byteOffset + 117, 8).getBigUint64(0, true).toString()
        : "1000000000000000000";
      setMinted({
        asset: assetKey.publicKey.toBase58(),
        grove: grove.toBase58(),
        nonce,
        amount: lamports,
        imageUrl: `${origin}/api/cards/${assetKey.publicKey.toBase58()}/image${suffix}`,
        metaUrl: uri,
        shareUrl: `${origin}/share/${assetKey.publicKey.toBase58()}${suffix}`,
        weight,
      });
      setClaimed(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("insufficient funds")) setError("Couldn't mint — insufficient mUSDC. Get test funds and try again.");
      else if (msg.includes("0x1")) setError("Couldn't mint — transaction failed. Check balance and try again.");
      else setError(`Couldn't mint — ${msg.slice(0, 160)}. Try again.`);
    } finally {
      setBusy(null);
    }
  }

  async function claim() {
    if (!publicKey || !minted) return;
    setError(null);
    setBusy("Claiming…");
    try {
      const grove = new PublicKey(minted.grove);
      const record = recordPda(grove, publicKey, 0);
      const vault = ata(MUSDC, grove);
      const ix = buildClaim({
        owner: publicKey,
        grove,
        nonce: minted.nonce,
        index: 0,
        vault,
        ownerAta: ata(MUSDC, publicKey),
        record,
        coreAsset: new PublicKey(minted.asset),
      });
      const tx = new Transaction().add(ix);
      const sig = await sendTransaction(tx, connection);
      await connection.confirmTransaction(sig, "confirmed");
      setClaimed(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(`Couldn't claim — ${msg.slice(0, 160)}. Try again.`);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="glass rounded-2xl p-6 sm:p-8">
        <label htmlFor="instant-amount" className="font-mono2 text-sm tracking-[0.12em] text-[var(--canopy-muted)]">
          Amount
        </label>
        <p id="instant-amount-help" className="mono text-sm text-[var(--canopy-muted)]">mUSDC on devnet · 6 decimals</p>
        <div className="mt-3 flex items-center gap-3">
          <span className="font-display text-4xl font-extrabold text-[var(--canopy-muted)]">$</span>
          <input
            id="instant-amount"
            value={usd}
            onChange={(e) => setUsd(e.target.value)}
            inputMode="decimal"
            aria-describedby="instant-amount-help"
            aria-invalid={!valid}
            className="font-display w-full bg-transparent text-5xl font-extrabold outline-none placeholder:text-[var(--canopy-line)]"
            placeholder="2.00"
          />
        </div>
        <div className="mt-6 space-y-2 font-mono2 text-sm text-[var(--canopy-muted)]">
          <div className="flex justify-between">
            <span>Treasury fee (1%)</span>
            <span className="tabular">${(fee / 1e6).toFixed(4)}</span>
          </div>
          <div className="flex justify-between text-[var(--canopy-text)]">
            <span>Vault backing</span>
            <span className="tabular">${(net / 1e6).toFixed(4)}</span>
          </div>
          <div className="flex justify-between">
            <span>Reveal</span>
            <span className="text-[var(--canopy-green)]">instant · same tx</span>
          </div>
        </div>
        <button
          onClick={mint}
          disabled={busy !== null || !connected}
          className={cn(
            "btn-primary mt-8 w-full px-8 py-4 text-sm disabled:opacity-40",
            "focus-visible:outline-none"
          )}
        >
          {busy ?? (connected ? `Mint for $${(lamports / 1e6).toFixed(2)}` : "Connect wallet to mint")}
        </button>
        {error && (
          <p className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 font-mono2 text-sm text-red-300" role="alert">
            {error}
          </p>
        )}
        <p className="mt-4 font-mono2 text-sm leading-relaxed text-[var(--canopy-muted)]">
          Settles in mock mUSDC on devnet. Solo weight is always 100%
          (Legendary band); the operative look still rolls unique per pull.
        </p>
      </div>

      <div>
        {minted ? (
          <Rip
            imageUrl={minted.imageUrl}
            title={asset ? `${asset.symbol} Canopy Share` : "Canopy Instant Share"}
            subtitle={`100% · $${(net / 1e6).toFixed(4)} devnet backing`}
            shareUrl={minted.shareUrl}
            onClaim={claim}
            claiming={busy === "Claiming…"}
            claimed={claimed}
          />
        ) : (
          <div className="glass flex h-full min-h-[420px] flex-col items-center justify-center rounded-2xl p-8 text-center">
            <img src="/mark.svg" alt="" width={72} height={72} className="opacity-60" />
            <p className="mt-6 font-display text-lg font-bold">Your cipher appears here</p>
            <p className="mt-2 max-w-xs text-sm text-[var(--canopy-muted)]">
              Mint to forge a sealed Share, rip it open, and claim its mock mUSDC backing
              — all without leaving this screen.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export { Connection as _C };
