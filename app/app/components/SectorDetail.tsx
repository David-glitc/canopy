"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ComputeBudgetProgram,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  CANOPY_ID,
  MUSDC,
  ata,
  buildClaim,
  buildCloseGrove,
  buildCommitReveal,
  buildDeposit,
  buildRefund,
  buildReveal,
  grovePda,
  parseGrove,
  parseRecord,
  recordPda,
  revealPda,
  type GroveData,
  type RecordData,
} from "@/lib/canopy-ix";
import { FUTARCHY_ID, parseMarket, marketPrice, type MarketData } from "@/lib/futarchy-read";

type RecRow = RecordData & { address: string };

const STATUS = ["Funding", "Closed", "Cancelled", "Revealed"] as const;

export default function SectorDetail({ address }: { address: string }) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected } = useWallet();
  const [grove, setGrove] = useState<(GroveData & { nonce: bigint; creator: string }) | null>(null);
  const [records, setRecords] = useState<RecRow[] | null>(null);
  const [vaultBal, setVaultBal] = useState<bigint | null>(null);
  const [revealOn, setRevealOn] = useState<{ closeSlot: bigint; done: boolean } | null>(null);
  const [slot, setSlot] = useState<number | null>(null);
  const [markets, setMarkets] = useState<MarketData[] | null>(null);
  const [tab, setTab] = useState<"overview" | "advance" | "govern">("overview");
  const [amount, setAmount] = useState("5");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [myBal, setMyBal] = useState<bigint | null>(null);

  const grovePk = new PublicKey(address);

  const load = useCallback(async () => {
    try {
      const g = await connection.getAccountInfo(grovePk);
      if (!g) return;
      const gd = parseGrove(new Uint8Array(g.data));
      // nonce/creator are instruction args, not stored plainly; recover creator + nonce
      // by matching seeds is infeasible — store from known groves is skipped.
      // Instead we read creator/nonce from the account (creator stored, nonce stored).
      setGrove({ ...gd, nonce: gd.nonce, creator: gd.creator } as never);
      const recs = await connection.getProgramAccounts(CANOPY_ID, {
        filters: [{ dataSize: 8 + 119 }, { memcmp: { offset: 8, bytes: address } }],
      });
      const rows: RecRow[] = recs
        .map(({ pubkey, account }) => ({
          address: pubkey.toBase58(),
          ...parseRecord(new Uint8Array(account.data)),
        }))
        .sort((a, b) => a.index - b.index);
      setRecords(rows);
      try {
        const vb = await connection.getTokenAccountBalance(new PublicKey(gd.vault));
        setVaultBal(BigInt(vb.value.amount));
      } catch {
        setVaultBal(null);
      }
      const rpda = revealPda(grovePk);
      const ri = await connection.getAccountInfo(rpda);
      if (ri && ri.data.length >= 82) {
        const closeSlot = new DataView(ri.data.buffer, ri.data.byteOffset + 40, 8).getBigUint64(0, true);
        setRevealOn({ closeSlot, done: ri.data[80] === 1 });
      } else {
        setRevealOn(null);
      }
      setSlot(await connection.getSlot());
      const mkts = await connection.getProgramAccounts(FUTARCHY_ID, {
        filters: [{ dataSize: 8 + 299 }],
      });
      const ms: MarketData[] = [];
      for (const { pubkey, account } of mkts) {
        try {
          const m = parseMarket(pubkey.toBase58(), new Uint8Array(account.data));
          if (m.grove === address) ms.push(m);
        } catch {
          /* skip */
        }
      }
      ms.sort((a, b) => Number(a.proposalId - b.proposalId));
      setMarkets(ms);
      if (publicKey) {
        try {
          const b = await connection.getTokenAccountBalance(ata(MUSDC, publicKey));
          setMyBal(BigInt(b.value.amount));
        } catch {
          setMyBal(0n);
        }
      }
    } catch {
      /* keep skeleton */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connection, address, publicKey]);

  useEffect(() => {
    load();
  }, [load]);

  async function run(label: string, fn: () => Promise<void>) {
    setError(null);
    setBusy(label);
    try {
      await fn();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message.slice(0, 240) : String(e));
    } finally {
      setBusy(null);
    }
  }

  if (!grove) {
    return <div className="glass h-64 animate-pulse rounded-2xl" />;
  }

  const creatorPk = new PublicKey(grove.creator);
  const now = Math.floor(Date.now() / 1000);
  const myRecs = records?.filter((r) => publicKey && r.owner === publicKey.toBase58()) ?? [];
  const canClose = grove.status === 0 && grove.total >= grove.goal;
  const canCancel =
    grove.status === 0 && now >= Number(grove.deadline) && grove.total < grove.goal;
  const revealReady =
    grove.status === 1 && revealOn && slot !== null && BigInt(slot) >= revealOn.closeSlot + 10n;

  async function fund() {
    if (!publicKey || !grove) return;
    const amt = BigInt(Math.round(parseFloat(amount || "0") * 1e6));
    await run("Funding…", async () => {
      const idx = grove.shareCount;
      const record = recordPda(grovePk, publicKey, idx);
      const asset = Keypair.generate();
      const origin = window.location.origin;
      const uri = `${origin}/api/cards/${asset.publicKey.toBase58()}/metadata?grove=${address}&index=${idx}`;
      const userAta = ata(MUSDC, publicKey);
      const ixs = [];
      if ((await connection.getAccountInfo(userAta)) === null) {
        ixs.push(
          createAssociatedTokenAccountInstruction(
            publicKey,
            userAta,
            publicKey,
            MUSDC,
            TOKEN_2022_PROGRAM_ID
          )
        );
      }
      ixs.push(
        buildDeposit({
          depositor: publicKey,
          creator: creatorPk,
          nonce: grove.nonce,
          index: idx,
          amount: amt,
          name: "Canopy Share",
          uri: uri.slice(0, 200),
          grove: grovePk,
          vault: new PublicKey(grove.vault),
          depositorAta: userAta,
          record,
          asset: asset.publicKey,
        })
      );
      const sig = await sendTransaction(new Transaction().add(...ixs), connection, {
        signers: [asset],
      });
      await connection.confirmTransaction(sig, "confirmed");
    });
  }

  async function advance(kind: "close" | "cancel" | "commit" | "reveal") {
    if (!publicKey || !grove) return;
    await run(kind === "reveal" ? "Revealing…" : "Submitting…", async () => {
      if (kind === "close" || kind === "cancel") {
        const ix = buildCloseGrove({
          grove: grovePk,
          creator: creatorPk,
          nonce: grove.nonce,
          cancel: kind === "cancel",
        });
        const sig = await sendTransaction(new Transaction().add(ix), connection);
        await connection.confirmTransaction(sig, "confirmed");
      } else if (kind === "commit") {
        const ix = buildCommitReveal({
          keeper: publicKey,
          grove: grovePk,
          creator: creatorPk,
          nonce: grove.nonce,
          revealState: revealPda(grovePk),
        });
        const sig = await sendTransaction(new Transaction().add(ix), connection);
        await connection.confirmTransaction(sig, "confirmed");
      } else {
        if (!records) throw new Error("records not loaded");
        const pairs = records.map((r) => ({
          record: new PublicKey(r.address),
          asset: new PublicKey(r.coreAsset),
        }));
        const ix = buildReveal({
          keeper: publicKey,
          grove: grovePk,
          creator: creatorPk,
          nonce: grove.nonce,
          revealState: revealPda(grovePk),
          pairs,
        });
        const tx = new Transaction().add(
          ComputeBudgetProgram.setComputeUnitLimit({ units: 600_000 }),
          ix
        );
        const sig = await sendTransaction(tx, connection);
        await connection.confirmTransaction(sig, "confirmed");
      }
    });
  }

  async function claimRec(r: RecRow) {
    if (!publicKey || !grove) return;
    await run("Claiming…", async () => {
      const ix = buildClaim({
        owner: publicKey,
        grove: grovePk,
        nonce: grove.nonce,
        index: r.index,
        vault: new PublicKey(grove.vault),
        ownerAta: ata(MUSDC, publicKey),
        record: new PublicKey(r.address),
        coreAsset: new PublicKey(r.coreAsset),
      });
      const sig = await sendTransaction(new Transaction().add(ix), connection);
      await connection.confirmTransaction(sig, "confirmed");
    });
  }

  async function faucet() {
    if (!publicKey) return;
    await run("Requesting test funds…", async () => {
      const res = await fetch("/api/faucet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: publicKey.toBase58() }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? "faucet failed");
    });
  }

  const pct = grove.goal > 0n ? Math.min(100, (Number(grove.total) / Number(grove.goal)) * 100) : 0;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-[var(--canopy-purple)]/15 px-3 py-1 font-mono2 text-xs text-[var(--canopy-purple)]">
          {STATUS[grove.status]}
        </span>
        <span className="font-mono2 text-xs text-[var(--canopy-muted)]">
          {address.slice(0, 6)}…{address.slice(-4)} · by {grove.creator.slice(0, 6)}…{grove.creator.slice(-4)}
        </span>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-4">
        {[
          ["Raised", `$${(Number(grove.total) / 1e6).toFixed(2)} / $${(Number(grove.goal) / 1e6).toFixed(2)}`],
          ["Vault", vaultBal === null ? "…" : `$${(Number(vaultBal) / 1e6).toFixed(2)}`],
          ["Shares", `${grove.shareCount}`],
          ["Min", `$${(Number(grove.minDeposit) / 1e6).toFixed(2)}`],
        ].map(([k, v]) => (
          <div key={k} className="glass rounded-2xl p-4">
            <p className="font-mono2 text-[11px] tracking-[0.2em] text-[var(--canopy-muted)]">{k.toUpperCase()}</p>
            <p className="font-display mt-1 text-xl font-extrabold">{v}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--canopy-gradient)" }} />
      </div>

      <div className="mt-6 flex gap-2 border-b border-[var(--canopy-line)]">
        {(["overview", "advance", "govern"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 font-mono2 text-xs tracking-[0.2em] ${
              tab === t
                ? "border-b-2 border-[var(--canopy-green)] text-[var(--canopy-text)]"
                : "text-[var(--canopy-muted)] hover:text-[var(--canopy-text)]"
            }`}
          >
            {t === "overview" ? "SHARES" : t === "advance" ? "FUND + ADVANCE" : "GOVERNANCE"}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {records === null &&
            [0, 1, 2].map((i) => <div key={i} className="glass h-72 animate-pulse rounded-2xl" />)}
          {records?.map((r) => (
            <div key={r.address} className="glass overflow-hidden rounded-2xl">
              {r.revealed ? (
                <img
                  src={`/api/cards/${r.coreAsset}/image?grove=${address}&index=${r.index}`}
                  alt={`Share ${r.index}`}
                  className="aspect-[2/3] w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex aspect-[2/3] w-full flex-col items-center justify-center gap-3 bg-[radial-gradient(ellipse_at_50%_40%,#12261c_0%,#050505_70%)]">
                  <img src="/mark.svg" alt="" width={54} height={54} className="opacity-70" />
                  <span className="font-mono2 text-[11px] tracking-[0.35em] text-[var(--canopy-green)]">SEALED</span>
                </div>
              )}
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="font-mono2 text-xs">#{r.index} · {(Number(r.deposit) / 1e6).toFixed(2)}</p>
                  <p className="font-mono2 text-[11px] text-[var(--canopy-muted)]">
                    {r.owner.slice(0, 6)}…{r.owner.slice(-4)} · {r.status === 0 ? (r.revealed ? `${(Number(r.weight) / 1e16).toFixed(2)}%` : "sealed") : r.status === 1 ? "refunded" : "claimed"}
                  </p>
                </div>
                {publicKey && r.owner === publicKey.toBase58() && r.status === 0 && r.revealed && grove.status === 3 && (
                  <button onClick={() => claimRec(r)} disabled={busy !== null} className="btn-primary px-4 py-2 text-xs disabled:opacity-40">
                    Claim
                  </button>
                )}
              </div>
            </div>
          ))}
          {records?.length === 0 && (
            <p className="text-sm text-[var(--canopy-muted)]">No shares yet — be the first to fund.</p>
          )}
        </div>
      )}

      {tab === "advance" && (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="glass rounded-2xl p-6">
            <h3 className="font-display font-bold">Fund this sector</h3>
            <div className="mt-3 flex items-center gap-3">
              <span className="text-2xl text-[var(--canopy-muted)]">$</span>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="decimal"
                className="font-display w-full bg-transparent text-4xl font-extrabold outline-none"
                placeholder="5.00"
              />
            </div>
            <p className="mt-2 font-mono2 text-xs text-[var(--canopy-muted)]">
              Balance: {myBal === null ? "…" : `$${(Number(myBal) / 1e6).toFixed(2)} mUSDC`}
              {myBal !== null && myBal < 1_000_000n && (
                <button onClick={faucet} disabled={busy !== null} className="ml-2 text-[var(--canopy-green)] hover:underline disabled:opacity-40">
                  get test funds
                </button>
              )}
            </p>
            <button onClick={fund} disabled={busy !== null || !connected || grove.status !== 0} className="btn-primary mt-5 w-full px-6 py-3 text-sm disabled:opacity-40">
              {busy ?? "Mint Share"}
            </button>
          </div>
          <div className="glass rounded-2xl p-6">
            <h3 className="font-display font-bold">Advance the lifecycle</h3>
            <p className="mt-1 font-mono2 text-xs text-[var(--canopy-muted)]">
              Permissionless cranks. Anyone may push a ready sector forward.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <button onClick={() => advance("close")} disabled={busy !== null || !canClose} className="btn-ghost px-4 py-2.5 text-xs disabled:opacity-40">
                Seal (goal met)
              </button>
              <button onClick={() => advance("cancel")} disabled={busy !== null || !canCancel} className="btn-ghost px-4 py-2.5 text-xs disabled:opacity-40">
                Cancel (expired)
              </button>
              <button onClick={() => advance("commit")} disabled={busy !== null || !(grove.status === 1 && !revealOn)} className="btn-ghost px-4 py-2.5 text-xs disabled:opacity-40">
                Commit reveal
              </button>
              <button onClick={() => advance("reveal")} disabled={busy !== null || !revealReady} className="btn-ghost px-4 py-2.5 text-xs disabled:opacity-40" title={revealReady ? "Ready" : "Needs commit + 10 slots"}>
                Reveal
              </button>
            </div>
            {myRecs.length > 0 && (
              <div className="mt-4 border-t border-[var(--canopy-line)] pt-4">
                <p className="font-mono2 text-xs text-[var(--canopy-muted)]">MY SHARES ({myRecs.length})</p>
                {myRecs.map((r) => (
                  <div key={r.address} className="mt-2 flex items-center justify-between text-sm">
                    <span className="font-mono2 text-xs">#{r.index} · {(Number(r.deposit) / 1e6).toFixed(2)}</span>
                    {grove.status === 3 && r.status === 0 && r.revealed && (
                      <button onClick={() => claimRec(r)} disabled={busy !== null} className="btn-primary px-4 py-1.5 text-xs disabled:opacity-40">
                        Claim {(Number(r.weight) * Number(grove.total) / 1e18 / 1e6).toFixed(4)}
                      </button>
                    )}
                    {grove.status === 2 && r.status === 0 && (
                      <span className="font-mono2 text-xs text-[var(--canopy-muted)]">refund via owner flow</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "govern" && (
        <div className="mt-6 space-y-3">
          {markets === null && <div className="glass h-24 animate-pulse rounded-2xl" />}
          {markets?.map((m) => {
            const price = marketPrice(m);
            const closesIn = Number(m.closesAt) - Math.floor(Date.now() / 1000);
            return (
              <div key={m.address} className="glass rounded-2xl p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-mono2 text-sm font-bold">Proposal #{m.proposalId.toString()}</p>
                  <span className={`rounded-full px-3 py-1 font-mono2 text-[11px] ${m.decided ? (m.passed ? "bg-[var(--canopy-green)]/15 text-[var(--canopy-green)]" : "bg-white/10 text-[var(--canopy-muted)]") : "bg-[var(--canopy-purple)]/15 text-[var(--canopy-purple)]"}`}>
                    {m.decided ? (m.passed ? "PASSED" : "REJECTED") : closesIn > 0 ? `open · ${Math.floor(closesIn / 60)}m left` : "closing…"}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-4 font-mono2 text-xs text-[var(--canopy-muted)]">
                  <span>PASS price <span className="text-[var(--canopy-text)]">{price.toFixed(3)}</span></span>
                  <span>trades <span className="text-[var(--canopy-text)]">{m.tradeCount.toString()}</span></span>
                  <span>book <span className="text-[var(--canopy-text)]">{(Number(m.passReserve) / 1e6).toFixed(2)} / {(Number(m.failReserve) / 1e6).toFixed(2)}</span></span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full" style={{ width: `${Math.min(100, (price / 2) * 100)}%`, background: "var(--canopy-gradient)" }} />
                </div>
              </div>
            );
          })}
          {markets?.length === 0 && (
            <p className="text-sm text-[var(--canopy-muted)]">
              No proposals yet. Owners bond collateral to open a pass/fail market on allocation changes — trading UI lands next.
            </p>
          )}
        </div>
      )}

      {busy && <p className="mt-4 font-mono2 text-xs text-[var(--canopy-green)]">{busy}</p>}
      {error && (
        <p className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 font-mono2 text-xs text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
