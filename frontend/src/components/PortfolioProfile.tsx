"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { useConnection } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { CANOPY_ID, parseGrove, parseRecord, revealPda, type GroveData, type RecordData } from "@/lib/canopy-ix";
import { useUnifiedWallet } from "@/lib/useUnifiedWallet";
import { cn } from "@/lib/utils";

type InventoryItem = RecordData & {
  address: string;
  groveData: GroveData;
  kind: "instant" | "share";
  nav: bigint;
};

type Filter = "all" | "instant" | "share";

function money(micros: bigint) {
  return `$${(Number(micros) / 1e6).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function short(value: string) {
  return `${value.slice(0, 5)}··${value.slice(-4)}`;
}

function rarity(weight: bigint) {
  const point = 10_000_000_000_000_000n;
  if (weight >= 40n * point) return "Legendary";
  if (weight >= 20n * point) return "Epic";
  if (weight >= 8n * point) return "Rare";
  return "Common";
}

function itemState(item: InventoryItem) {
  if (item.status === 1) return "Refunded";
  if (item.status === 2) return "Claimed";
  if (item.revealed) return "Revealed";
  return "Sealed";
}

export default function PortfolioProfile({ address }: { address?: string }) {
  const { connection } = useConnection();
  const wallet = useUnifiedWallet();
  const { setVisible } = useWalletModal();
  const owner = address ?? wallet.publicKey?.toBase58() ?? null;
  const [items, setItems] = useState<InventoryItem[] | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!owner) {
      setItems(null);
      return;
    }
    setError(null);
    try {
      const ownerPk = new PublicKey(owner);
      const records = await connection.getProgramAccounts(CANOPY_ID, {
        filters: [
          { dataSize: 8 + 119 },
          { memcmp: { offset: 40, bytes: ownerPk.toBase58() } },
        ],
      });
      const parsed = records.map(({ pubkey, account }) => ({
        address: pubkey.toBase58(),
        ...parseRecord(new Uint8Array(account.data)),
      }));
      if (parsed.length === 0) {
        setItems([]);
        return;
      }
      const groveAddresses = [...new Set(parsed.map((record) => record.grove))];
      const groveKeys = groveAddresses.map((grove) => new PublicKey(grove));
      const [groveInfos, revealInfos] = await Promise.all([
        connection.getMultipleAccountsInfo(groveKeys),
        connection.getMultipleAccountsInfo(groveKeys.map((grove) => revealPda(grove))),
      ]);
      const groveMap = new Map<string, GroveData>();
      groveInfos.forEach((info, index) => {
        if (info) groveMap.set(groveAddresses[index], parseGrove(new Uint8Array(info.data)));
      });
      const hasReveal = new Map(groveAddresses.map((grove, index) => [grove, Boolean(revealInfos[index])]));
      const inventory = parsed.flatMap((record): InventoryItem[] => {
        const groveData = groveMap.get(record.grove);
        if (!groveData) return [];
        const instant =
          groveData.status === 3 &&
          groveData.shareCount === 1 &&
          groveData.creator === owner &&
          !hasReveal.get(record.grove);
        const nav = record.revealed && record.weight > 0n
          ? (groveData.total * record.weight) / 1_000_000_000_000_000_000n
          : record.deposit;
        return [{ ...record, groveData, kind: instant ? "instant" : "share", nav }];
      });
      inventory.sort((a, b) => b.kind.localeCompare(a.kind) || b.index - a.index);
      setItems(inventory);
    } catch {
      setItems([]);
      setError("Canopy could not read this wallet’s inventory from devnet.");
    }
  }, [connection, owner]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const totals = useMemo(() => {
    const rows = items ?? [];
    const active = rows.filter((item) => item.status === 0);
    return {
      value: active.reduce((sum, item) => sum + item.nav, 0n),
      deposited: rows.reduce((sum, item) => sum + item.deposit, 0n),
      instants: rows.filter((item) => item.kind === "instant").length,
      shares: rows.filter((item) => item.kind === "share").length,
      revealed: rows.filter((item) => item.revealed).length,
      xp: rows.reduce((sum, item) => sum + Math.floor(Number(item.deposit) / 1e6) * 10 + 100 + (item.revealed ? 150 : 0), 0),
    };
  }, [items]);

  const visible = useMemo(
    () => (items ?? []).filter((item) => filter === "all" || item.kind === filter),
    [filter, items]
  );

  if (!owner) {
    return (
      <section className="profile-connect">
        <span className="profile-orbit" aria-hidden="true"><i>C</i></span>
        <p className="page-kicker">Your Canopy account</p>
        <h1>One wallet. Every position.</h1>
        <p>Connect Phantom or Solflare to load instant mints, group-vault shares, NAV, reveal state, and XP.</p>
        <button type="button" className="btn-primary" onClick={() => setVisible(true)}>Connect wallet →</button>
      </section>
    );
  }

  const isMine = wallet.publicKey?.toBase58() === owner;

  return (
    <div className="profile-dashboard">
      <section className="profile-hero">
        <div className="profile-identity">
          <span className="profile-avatar-large">{owner.slice(0, 2)}</span>
          <div>
            <span>{isMine ? "YOUR CANOPY ACCOUNT" : "PUBLIC CANOPY ACCOUNT"}</span>
            <h1>{short(owner)}</h1>
            <p>{owner}</p>
          </div>
        </div>
        <div className="profile-hero-actions">
          <a href={`https://explorer.solana.com/address/${owner}?cluster=devnet`} target="_blank" rel="noreferrer" className="btn-ghost">Explorer ↗</a>
          <button type="button" onClick={() => void load()} className="btn-ghost">Refresh</button>
        </div>
      </section>

      <section className="profile-metrics">
        <div className="profile-metric-primary"><span>ACTIVE POSITION VALUE</span><strong>{items === null ? "—" : money(totals.value)}</strong><small>Current on-chain vault share</small></div>
        <div><span>COLLECTIBLES</span><strong>{items === null ? "—" : items.length}</strong><small>{totals.instants} instant · {totals.shares} vault</small></div>
        <div><span>REVEALED</span><strong>{items === null ? "—" : totals.revealed}</strong><small>Runtime Digital Matter</small></div>
        <div><span>XP</span><strong>{items === null ? "—" : totals.xp.toLocaleString()}</strong><small>{money(totals.deposited)} funded</small></div>
      </section>

      <div className="inventory-bar">
        <div>
          <p className="vault-section-label">INVENTORY</p>
          <strong>Instants and vault shares</strong>
        </div>
        <div className="inventory-filters">
          {([
            ["all", "All", items?.length ?? 0],
            ["instant", "Instants", totals.instants],
            ["share", "Vault shares", totals.shares],
          ] as const).map(([id, label, count]) => (
            <button key={id} type="button" onClick={() => setFilter(id)} className={cn(filter === id && "is-active")}>
              {label}<span>{count}</span>
            </button>
          ))}
        </div>
      </div>

      {error && <p className="vault-error">{error}</p>}
      {items === null ? (
        <div className="inventory-grid">{[0, 1, 2].map((value) => <div key={value} className="inventory-card inventory-loading" />)}</div>
      ) : visible.length ? (
        <div className="inventory-grid">
          {visible.map((item) => {
            const qs = item.kind === "share" ? `?grove=${item.grove}&index=${item.index}` : "";
            const state = itemState(item);
            return (
              <article key={item.address} className="inventory-card">
                <div className="inventory-art">
                  {item.revealed && item.status === 0 ? (
                    <img src={`/api/cards/${item.coreAsset}/image${qs}`} alt="" onError={(event) => { event.currentTarget.style.display = "none"; }} />
                  ) : (
                    <div className="inventory-seal"><img src="/mark.svg" alt="" /><span>{state.toUpperCase()}</span></div>
                  )}
                  <span className={cn("inventory-kind", item.kind === "instant" && "is-instant")}>{item.kind === "instant" ? "INSTANT" : "VAULT SHARE"}</span>
                  <span className="inventory-state">{state}</span>
                </div>
                <div className="inventory-card-body">
                  <div className="inventory-title"><div><span>{rarity(item.weight)}</span><h2>{item.kind === "instant" ? "Solo Matter" : `Vault Share #${item.index}`}</h2></div><strong>{money(item.nav)}</strong></div>
                  <div className="inventory-data">
                    <div><span>Deposited</span><strong>{money(item.deposit)}</strong></div>
                    <div><span>Ownership</span><strong>{item.revealed ? `${(Number(item.weight) / 1e16).toFixed(2)}%` : "Sealed"}</strong></div>
                    <div><span>Vault</span><strong>{short(item.grove)}</strong></div>
                  </div>
                  <div className="inventory-actions">
                    <Link href={`/share/${item.coreAsset}${qs}`}>Open collectible</Link>
                    <Link href={`/sectors/${item.grove}`}>Manage position ↗</Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="profile-empty">
          <span>00</span><h2>{filter === "all" ? "No positions in this wallet." : `No ${filter === "instant" ? "instant mints" : "vault shares"} yet.`}</h2>
          <p>Choose a market for a solo mint or join a group vault to create the first position.</p>
          {isMine && <div><Link href="/markets" className="btn-primary">Create an instant</Link><Link href="/sectors" className="btn-ghost">Browse vaults</Link></div>}
        </div>
      )}
    </div>
  );
}
