"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { CANOPY_ID, parseRecord } from "@/lib/canopy-ix";
import { useUnifiedWallet } from "@/lib/useUnifiedWallet";
import { cn } from "@/lib/utils";

type Player = {
  owner: string;
  deposited: bigint;
  positions: number;
  reveals: number;
  xp: number;
};

function short(owner: string) {
  return `${owner.slice(0, 5)}··${owner.slice(-4)}`;
}

function usd(value: bigint) {
  return `$${(Number(value) / 1e6).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function initials(owner: string) {
  return owner.slice(0, 2).toUpperCase();
}

export default function XPLeaderboard() {
  const { connection } = useConnection();
  const { publicKey } = useUnifiedWallet();
  const [players, setPlayers] = useState<Player[] | null>(null);

  const load = useCallback(async () => {
    try {
      const accounts = await connection.getProgramAccounts(CANOPY_ID, {
        filters: [{ dataSize: 8 + 119 }],
      });
      const byOwner = new Map<string, Player>();
      for (const { account } of accounts) {
        try {
          const record = parseRecord(new Uint8Array(account.data));
          const player = byOwner.get(record.owner) ?? {
            owner: record.owner,
            deposited: 0n,
            positions: 0,
            reveals: 0,
            xp: 0,
          };
          player.deposited += record.deposit;
          player.positions += 1;
          player.reveals += record.revealed ? 1 : 0;
          byOwner.set(record.owner, player);
        } catch {
          // Ignore accounts that do not match the record layout.
        }
      }
      const rows = [...byOwner.values()].map((player) => ({
        ...player,
        xp: Math.floor(Number(player.deposited) / 1e6) * 10 + player.positions * 100 + player.reveals * 150,
      }));
      rows.sort((a, b) => b.xp - a.xp || Number(b.deposited - a.deposited));
      setPlayers(rows);
    } catch {
      setPlayers([]);
    }
  }, [connection]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const stats = useMemo(() => ({
    totalXp: (players ?? []).reduce((sum, player) => sum + player.xp, 0),
    deposits: (players ?? []).reduce((sum, player) => sum + player.deposited, 0n),
    positions: (players ?? []).reduce((sum, player) => sum + player.positions, 0),
  }), [players]);

  const top = players?.slice(0, 3) ?? [];
  const order = [top[1], top[0], top[2]].filter(Boolean);

  return (
    <div className="xp-board">
      <section className="xp-hero">
        <div>
          <span className="live-label"><i /> SEASON 01 · LIVE</span>
          <p className="xp-kicker">CANOPY REPUTATION</p>
          <h1>Every position builds reputation.</h1>
          <p>Create matter, join vaults, and complete reveals. Every point comes from verifiable activity.</p>
        </div>
        <div className="xp-hero-score">
          <small>NETWORK XP</small>
          <strong>{players === null ? "—" : stats.totalXp.toLocaleString()}</strong>
          <span>{players === null ? "Syncing activity…" : `${players.length} active collectors`}</span>
        </div>
      </section>

      <div className="xp-stat-strip">
        <div><span>Total deposits</span><strong>{players === null ? "—" : usd(stats.deposits)}</strong></div>
        <div><span>Minted positions</span><strong>{players === null ? "—" : stats.positions}</strong></div>
        <div><span>Season</span><strong>Genesis</strong></div>
        <button type="button" onClick={() => void load()}>Refresh ranks ↻</button>
      </div>

      {players === null ? (
        <div className="xp-loading"><div /><div /><div /></div>
      ) : players.length > 0 ? (
        <>
          <section className="xp-podium" aria-label="Top three collectors">
            {order.map((player) => {
              const rank = players.indexOf(player) + 1;
              return (
                <div key={player.owner} className={cn("xp-podium-player", rank === 1 && "is-first")}>
                  <span className="xp-rank">#{rank.toString().padStart(2, "0")}</span>
                  <div className="xp-avatar">{initials(player.owner)}</div>
                  <strong>{short(player.owner)}</strong>
                  <p>{player.xp.toLocaleString()} XP</p>
                  <small>{player.positions} positions · {usd(player.deposited)}</small>
                </div>
              );
            })}
          </section>

          <section className="xp-table-wrap">
            <div className="xp-table-head">
              <div><span>GLOBAL RANKING</span><strong>All collectors</strong></div>
              <span>Updated onchain</span>
            </div>
            <div className="xp-table-scroll">
              <table className="xp-table">
                <thead><tr><th>Rank</th><th>Collector</th><th>Deposited</th><th>Positions</th><th>Reveals</th><th>XP</th></tr></thead>
                <tbody>
                  {players.map((player, index) => {
                    const mine = publicKey?.toBase58() === player.owner;
                    return (
                      <tr key={player.owner} className={cn(mine && "is-me")}>
                        <td><span className="xp-table-rank">{(index + 1).toString().padStart(2, "0")}</span></td>
                        <td><div className="xp-user"><span>{initials(player.owner)}</span><strong>{short(player.owner)} {mine && <i>YOU</i>}</strong></div></td>
                        <td>{usd(player.deposited)}</td>
                        <td>{player.positions}</td>
                        <td>{player.reveals}</td>
                        <td><strong className="xp-points">{player.xp.toLocaleString()}</strong></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : (
        <div className="xp-empty"><span>00</span><h2>The season starts with the first deposit.</h2><p>Open a group vault, mint a position, and claim the top rank.</p></div>
      )}

      <section className="xp-rules">
        <div><span>01</span><p><strong>Fund</strong>10 XP per dollar deposited</p></div>
        <div><span>02</span><p><strong>Collect</strong>100 XP for every position minted</p></div>
        <div><span>03</span><p><strong>Reveal</strong>150 XP when a position is revealed</p></div>
      </section>
    </div>
  );
}
