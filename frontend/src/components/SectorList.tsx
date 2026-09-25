"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
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
import { FundingCurve, seededFundingSeries, VaultCycle } from "@/components/VaultVisuals";

type GroveRow = GroveData & { address: string };

const STATUS = ["Funding", "Closed", "Cancelled", "Revealed"] as const;

function fmtUSD(micros: bigint, digits = 2): string {
  return `$${(Number(micros) / 1e6).toLocaleString(undefined, { maximumFractionDigits: digits })}`;
}

function countdown(deadline: bigint): string {
  const s = Number(deadline) - Math.floor(Date.now() / 1000);
  if (s <= 0) return "Cycle ended";
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  return d > 0 ? `${d}d ${h}h remaining` : `${h}h ${Math.floor((s % 3600) / 60)}m remaining`;
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
      rows.sort((a, b) => a.status !== b.status ? a.status - b.status : Number(b.total - a.total));
      setGroves(rows);
    } catch {
      setGroves([]);
    }
  }, [connection]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const aggregate = useMemo(() => {
    const rows = groves ?? [];
    const tvl = rows.reduce((sum, item) => sum + item.total, 0n);
    const shares = rows.reduce((sum, item) => sum + item.shareCount, 0);
    const active = rows.filter((item) => item.status === 0).length;
    const goal = rows.reduce((sum, item) => sum + item.goal, 0n);
    const progress = goal > 0n ? Math.min(100, Number(tvl) / Number(goal) * 100) : 0;
    return { tvl, shares, active, progress };
  }, [groves]);

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
      await load();
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
    <div className="vault-dashboard">
      <section className="vault-command">
        <div className="vault-command-copy">
          <span className="live-label"><i /> LIVE ON DEVNET</span>
          <p className="vault-command-eyebrow">Collective vault value</p>
          <p className="vault-command-value">{groves === null ? "—" : fmtUSD(aggregate.tvl)}</p>
          <p className="vault-command-note">Every deposit mints a unique position. NAV updates from the pooled on-chain balance.</p>
        </div>
        <div className="vault-command-chart">
          <div className="vault-chart-head"><span>NETWORK FUNDING</span><strong>{aggregate.progress.toFixed(1)}%</strong></div>
          <FundingCurve values={seededFundingSeries("canopy-network", aggregate.progress)} label="Aggregate vault funding curve" />
        </div>
        <div className="vault-command-stats">
          <div><span>Active cycles</span><strong>{groves === null ? "—" : aggregate.active}</strong></div>
          <div><span>Positions</span><strong>{groves === null ? "—" : aggregate.shares}</strong></div>
          <div><span>Network</span><strong>Solana</strong></div>
        </div>
      </section>

      <div className="vault-toolbar">
        <div>
          <p className="vault-section-label">LIVE VAULTS</p>
          <p className="vault-toolbar-copy">{groves === null ? "Reading on-chain accounts…" : `${groves.length} funding cycles found`}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => void load()} className="btn-ghost px-4 py-2 text-sm">Refresh data</button>
          {connected && <button onClick={() => setShowCreate((value) => !value)} className="btn-primary px-4 py-2 text-sm">{showCreate ? "Close" : "Create vault"}</button>}
        </div>
      </div>

      {showCreate && (
        <div className="vault-create-panel">
          <div className="vault-create-intro"><span>NEW CYCLE</span><strong>Set the rules, then invite the group.</strong></div>
          <label><span>Funding goal</span><div className="vault-input"><i>$</i><input value={goal} onChange={(e) => setGoal(e.target.value)} inputMode="decimal" placeholder="100" /></div><small>Minimum $1.00</small></label>
          <label><span>Minimum position</span><div className="vault-input"><i>$</i><input value={minDep} onChange={(e) => setMinDep(e.target.value)} inputMode="decimal" placeholder="2" /></div><small>Per collectible</small></label>
          <label><span>Funding window</span><div className="vault-input"><input value={days} onChange={(e) => setDays(e.target.value)} inputMode="decimal" placeholder="5" /><i>days</i></div><small>Until cycle close</small></label>
          <button onClick={create} disabled={busy} className="btn-primary vault-create-submit">{busy ? "Creating…" : "Launch cycle →"}</button>
        </div>
      )}
      {error && <p className="vault-error">{error}</p>}

      <div className="vault-grid">
        {groves === null && [0, 1, 2, 3].map((i) => <div key={i} className="vault-card vault-card-loading" />)}
        {groves?.map((grove, index) => {
          const pct = grove.goal > 0n ? Math.min(100, Number(grove.total) / Number(grove.goal) * 100) : 0;
          const nav = grove.shareCount > 0 ? Number(grove.total) / 1e6 / grove.shareCount : 0;
          return (
            <Link key={grove.address} href={`/sectors/${grove.address}`} className="vault-card" style={{ "--vault-delay": `${Math.min(index, 5) * 55}ms` } as CSSProperties}>
              <div className="vault-card-top">
                <span className={cn("vault-status", `vault-status-${grove.status}`)}><i />{STATUS[grove.status] ?? "Unknown"}</span>
                <span className="vault-card-id">{grove.address.slice(0, 5)}··{grove.address.slice(-4)}</span>
              </div>
              <div className="vault-card-value-row">
                <div><small>VAULT VALUE</small><strong>{fmtUSD(grove.total)}</strong></div>
                <span className="vault-open-arrow">↗</span>
              </div>
              <div className="vault-card-chart-head"><span>Funding curve</span><strong>{pct.toFixed(0)}%</strong></div>
              <FundingCurve compact values={seededFundingSeries(grove.address, pct)} label={`Funding progress for vault ${grove.address}`} />
              <div className="vault-card-metrics">
                <div><span>NAV / position</span><strong>${nav.toFixed(2)}</strong></div>
                <div><span>Goal</span><strong>{fmtUSD(grove.goal, 0)}</strong></div>
                <div><span>Positions</span><strong>{grove.shareCount}</strong></div>
              </div>
              <div className="vault-card-cycle">
                <div><span>{grove.status === 0 ? countdown(grove.deadline) : "Cycle complete"}</span><strong>{fmtUSD(grove.minDeposit)} min</strong></div>
                <VaultCycle status={grove.status} />
              </div>
            </Link>
          );
        })}
      </div>

      {groves?.length === 0 && (
        <div className="vault-empty">
          <span>01</span><h3>Start the first funding cycle.</h3><p>Create a vault, set a target, and mint a collectible for every deposit.</p>
          {connected && <button type="button" onClick={() => setShowCreate(true)} className="btn-primary mt-5">Create the first vault</button>}
        </div>
      )}
    </div>
  );
}
