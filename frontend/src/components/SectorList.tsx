"use client";

import { useCallback, useEffect, useState } from "react";
import { Transaction } from "@solana/web3.js";
import { useConnection } from "@solana/wallet-adapter-react";
import { useUnifiedWallet } from "@/lib/useUnifiedWallet";
import {
  CANOPY_ID,
  MUSDC,
  ata,
  buildCreateGrove,
  grovePda,
  parseGrove,
  type GroveData,
} from "@/lib/canopy-ix";
import { cn } from "@/lib/utils";

type GroveRow = GroveData & { address: string };

const STATUS = ["Funding", "Closed", "Cancelled", "Revealed"] as const;

function fmtUSD(micros: bigint): string {
  return `$${(Number(micros) / 1e6).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function countdown(deadline: bigint): string {
  const s = Number(deadline) - Math.floor(Date.now() / 1000);
  if (s <= 0) return "expired";
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600);
  return d > 0 ? `${d}d ${h}h left` : `${h}h ${Math.floor((s % 3600) / 60)}m left`;
}

export default function SectorList() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected } = useUnifiedWallet();
  const [groves, setGroves] = useState<GroveRow[] | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [goal, setGoal] = useState("100");
  const [minDep, setMinDep] = useState("2");
  const [days, setDays] = useState("5");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const accts = await connection.getProgramAccounts(CANOPY_ID, {
        filters: [{ dataSize: 8 + 142 }],
      });
      const rows: GroveRow[] = accts.map(({ pubkey, account }) => ({
        address: pubkey.toBase58(),
        ...parseGrove(new Uint8Array(account.data)),
      }));
      rows.sort((a, b) => {
        if (a.status !== b.status) return a.status - b.status;
        return Number(b.total - a.total);
      });
      setGroves(rows);
    } catch {
      setGroves([]);
    }
  }, [connection]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function create() {
    if (!publicKey) return;
    setError(null);
    setBusy(true);
    try {
      const nonce = BigInt(Date.now() % 100000) * 1000n + BigInt(Math.floor(Math.random() * 1000));
      const grove = grovePda(publicKey, nonce);
      const ix = buildCreateGrove({
        creator: publicKey,
        nonce,
        goal: BigInt(Math.round(parseFloat(goal || "0") * 1e6)),
        deadline: BigInt(Math.floor(Date.now() / 1000) + parseFloat(days || "0") * 86400),
        minDeposit: BigInt(Math.round(parseFloat(minDep || "0") * 1e6)),
        grove,
        vault: ata(MUSDC, grove),
      });
      const sig = await sendTransaction(new Transaction().add(ix), connection);
      await connection.confirmTransaction(sig, "confirmed");
      setShowCreate(false);
      load();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("GoalNotMet") || msg.includes("6009")) setError("The goal is invalid. Try a lower amount.");
      else if (msg.includes("insufficient funds")) setError("Not enough devnet SOL to create the vault.");
      else setError(`Vault creation failed: ${msg.slice(0, 160)}. Try again.`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="font-mono2 text-sm text-[var(--canopy-muted)]">
          {groves === null ? "Loading group vaults…" : `${groves.length} group vault${groves.length === 1 ? "" : "s"}`}
        </p>
        <div className="flex gap-2">
          <button onClick={() => void load()} className="btn-ghost px-4 py-2 text-sm">
            Refresh
          </button>
          {connected && (
            <button onClick={() => setShowCreate((s) => !s)} className="btn-primary px-4 py-2 text-sm">
              {showCreate ? "Close form" : "Create a group vault"}
            </button>
          )}
        </div>
      </div>

      {showCreate && (
        <div className="glass mt-4 grid gap-3 rounded-2xl p-5 sm:grid-cols-4">
          <label className="text-sm">
            <span className="font-mono2 text-[var(--canopy-muted)]">Funding goal</span>
            <input value={goal} onChange={(e) => setGoal(e.target.value)} inputMode="decimal" placeholder="100.00"
              className="mt-1 w-full rounded-lg border border-[var(--canopy-line)] bg-black/50 px-3 py-2 outline-none focus:border-[var(--canopy-green)]" />
            <span className="font-mono2 text-xs text-[var(--canopy-muted)]">USD, minimum 1.00</span>
          </label>
          <label className="text-sm">
            <span className="font-mono2 text-[var(--canopy-muted)]">Minimum deposit</span>
            <input value={minDep} onChange={(e) => setMinDep(e.target.value)} inputMode="decimal" placeholder="2.00"
              className="mt-1 w-full rounded-lg border border-[var(--canopy-line)] bg-black/50 px-3 py-2 outline-none focus:border-[var(--canopy-green)]" />
            <span className="font-mono2 text-xs text-[var(--canopy-muted)]">Mock USD per collectible</span>
          </label>
          <label className="text-sm">
            <span className="font-mono2 text-[var(--canopy-muted)]">Duration</span>
            <input value={days} onChange={(e) => setDays(e.target.value)} inputMode="decimal" placeholder="5"
              className="mt-1 w-full rounded-lg border border-[var(--canopy-line)] bg-black/50 px-3 py-2 outline-none focus:border-[var(--canopy-green)]" />
            <span className="font-mono2 text-xs text-[var(--canopy-muted)]">Days until close</span>
          </label>
          <div className="flex items-end">
            <button onClick={create} disabled={busy} className="btn-primary w-full px-4 py-2 text-sm disabled:opacity-40">
              {busy ? "Creating…" : "Create vault"}
            </button>
          </div>
        </div>
      )}
      {error && (
        <p className="mt-3 rounded-xl border border-red-500/40 bg-red-500/10 p-3 font-mono2 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {groves === null &&
          [0, 1, 2, 3].map((i) => (
            <div key={i} className="glass h-44 animate-pulse rounded-2xl" />
          ))}
        {groves?.map((g) => {
          const pct = g.goal > 0n ? Math.min(100, (Number(g.total) / Number(g.goal)) * 100) : 0;
          return (
            <a
              key={g.address}
              href={`/sectors/${g.address}`}
              className="glass group rounded-2xl p-5 transition-colors hover:border-[var(--canopy-green)]"
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "rounded-full px-3 py-1 font-mono2 text-sm",
                    g.status === 0
                      ? "bg-[rgba(20,241,149,0.15)] text-[var(--canopy-green)]"
                      : g.status === 3
                        ? "bg-[rgba(153,69,255,0.15)] text-[var(--canopy-purple)]"
                        : "bg-white/10 text-[var(--canopy-muted)]"
                  )}
                >
                  {STATUS[g.status] ?? "Unknown"}
                </span>
                <span className="font-mono2 text-sm tabular text-[var(--canopy-muted)]">
                  {g.status === 0 ? countdown(g.deadline) : `${g.shareCount} shares`}
                </span>
              </div>
              <p className="font-mono2 mt-3 text-sm text-[var(--canopy-muted)]">
                {g.address.slice(0, 6)}…{g.address.slice(-4)}
              </p>
              <div className="mt-3 flex items-end justify-between">
                <p className="font-display text-2xl font-extrabold">
                  {fmtUSD(g.total)}
                  <span className="text-sm font-normal text-[var(--canopy-muted)]"> / {fmtUSD(g.goal)}</span>
                </p>
                <span className="text-[var(--canopy-green)] opacity-0 transition-opacity group-hover:opacity-100">
                  Open →
                </span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[var(--canopy-green)]"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </a>
          );
        })}
      </div>
      {groves?.length === 0 && (
        <div className="mt-8 rounded-2xl border border-[var(--canopy-line)] bg-[var(--color-surface)] p-8 text-center">
          <p className="font-semibold">No group vaults yet</p>
          <p className="mt-1 text-pretty text-sm text-[var(--canopy-muted)]">Create one to pool mock deposits and mint a collectible for each depositor.</p>
          {connected && <button type="button" onClick={() => setShowCreate(true)} className="btn-primary mt-4 px-4 py-2 text-sm">Create the first vault</button>}
        </div>
      )}
    </div>
  );
}
