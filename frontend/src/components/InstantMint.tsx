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
import CompanyLogo from "./CompanyLogo";
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
      setError("Connect a wallet before minting.");
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
      if (msg.includes("insufficient funds")) setError("Not enough mock mUSDC. Get test funds and try again.");
      else if (msg.includes("0x1")) setError("The transaction failed. Check your devnet balance and try again.");
      else setError(`Mint failed: ${msg.slice(0, 160)}. Try again.`);
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
      setError(`Claim failed: ${msg.slice(0, 160)}. Try again.`);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="glass rounded-[1.5rem] p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <label htmlFor="instant-amount" className="text-sm font-bold">Choose an amount</label>
            <p id="instant-amount-help" className="mt-1 text-sm text-[var(--canopy-muted)]">Minimum $1.50 · mock funds only</p>
          </div>
          <span className="status">Devnet</span>
        </div>
        <div className="mt-8 flex items-center gap-3 border-b border-[var(--canopy-line)] pb-5">
          <span className="font-display text-4xl font-bold text-[var(--canopy-muted)]">$</span>
          <input
            id="instant-amount"
            value={usd}
            onChange={(e) => setUsd(e.target.value)}
            inputMode="decimal"
            aria-describedby="instant-amount-help"
            aria-invalid={!valid}
            className="amount-input font-display w-full bg-transparent font-bold tracking-[-.06em] outline-none placeholder:text-[var(--canopy-line)]"
            placeholder="2.00"
          />
        </div>
        <div className="mt-6 space-y-3 text-sm text-[var(--canopy-muted)]">
          <div className="flex justify-between">
            <span>App fee (1%)</span>
            <span className="tabular">${(fee / 1e6).toFixed(4)}</span>
          </div>
          <div className="flex justify-between text-[var(--canopy-text)]">
            <span>Stored in the demo vault</span>
            <span className="tabular">${(net / 1e6).toFixed(4)}</span>
          </div>
          <div className="flex justify-between">
            <span>Artwork</span>
            <span className="text-[var(--canopy-green)]">ready after mint</span>
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
          {busy ?? (connected ? `Mint demo collectible · $${(lamports / 1e6).toFixed(2)}` : "Connect wallet to mint")}
        </button>
        {error && (
          <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-[var(--danger)]" role="alert">
            {error}
          </p>
        )}
        <p className="mt-4 text-pretty text-xs leading-relaxed text-[var(--canopy-muted)]">
          This collectible is a devnet demo. It references a PreStocks token and does not represent stock ownership.
        </p>
      </div>

      <div>
        {minted ? (
          <Rip
            imageUrl={minted.imageUrl}
            title={asset ? `${asset.symbol} collectible` : "Canopy collectible"}
            subtitle={`$${(net / 1e6).toFixed(4)} stored in the devnet vault`}
            shareUrl={minted.shareUrl}
            onClaim={claim}
            claiming={busy === "Claiming…"}
            claimed={claimed}
          />
        ) : (
          <div className="mint-preview flex h-full min-h-[420px] flex-col items-center justify-center rounded-[1.5rem] p-8 text-center">
            <div className="mint-preview-art" aria-hidden="true">
              {asset ? <CompanyLogo symbol={asset.symbol} name={asset.symbol} className="mint-preview-logo" /> : <span>C</span>}
            </div>
            <p className="mt-7 text-lg font-bold text-white">Your collectible appears here</p>
            <p className="mt-2 max-w-xs text-pretty text-sm leading-6 text-white/55">
              Connect your wallet, mint with mock funds, then reveal the artwork.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export { Connection as _C };
