"use client";

import { useEffect, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";

const CANOPY = new PublicKey("9xmniHhMGswjyMGf9jW7YCireJaUARBozRSDWYU1Jrnf");
const FUTARCHY = new PublicKey("BP4hBGTDh2a3Rq1jarE2CQUUpBJcdr5a2KWnwP9qu68k");

export default function ProgramStatus() {
  const { connection } = useConnection();
  const [slot, setSlot] = useState<number | null>(null);
  const [deployed, setDeployed] = useState<[boolean, boolean] | null>(null);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const s = await connection.getSlot();
        const [a, b] = await Promise.all([
          connection.getAccountInfo(CANOPY),
          connection.getAccountInfo(FUTARCHY),
        ]);
        if (live) {
          setSlot(s);
          setDeployed([!!a?.executable, !!b?.executable]);
        }
      } catch {
        /* offline: leave skeleton */
      }
    })();
    return () => {
      live = false;
    };
  }, [connection]);

  const rows: Array<[string, string, string]> = [
    ["canopy", CANOPY.toBase58(), "groves · shares · reveal · claim · instant"],
    ["canopy-futarchy", FUTARCHY.toBase58(), "conditional markets · TWAP"],
  ];

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-bold tracking-[0.2em] text-[var(--canopy-muted)]">
          OVERLAYER STATUS
        </h3>
        <span className="font-mono2 text-xs text-[var(--canopy-green)]">
          {slot === null ? "…" : `slot ${slot.toLocaleString()}`}
        </span>
      </div>
      <div className="mt-4 space-y-3">
        {rows.map(([name, addr, desc], i) => (
          <div
            key={name}
            className="flex flex-col gap-1 rounded-xl border border-[var(--canopy-line)] bg-black/40 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block h-2 w-2 rounded-full ${
                    deployed === null
                      ? "bg-[var(--canopy-muted)]"
                      : deployed[i]
                        ? "bg-[var(--canopy-green)]"
                        : "bg-red-500"
                  }`}
                />
                <span className="font-mono2 text-sm font-bold">{name}</span>
              </div>
              <p className="mt-1 font-mono2 text-[11px] text-[var(--canopy-muted)]">
                {addr} · {desc}
              </p>
            </div>
            <a
              className="font-mono2 text-xs text-[var(--canopy-cyan)] hover:underline"
              href={`https://explorer.solana.com/address/${addr}?cluster=devnet`}
              target="_blank"
              rel="noreferrer"
            >
              explorer ↗
            </a>
          </div>
        ))}
      </div>
      <p className="mt-4 font-mono2 text-[11px] text-[var(--canopy-muted)]">
        devnet · mock mUSDC/xStocks · mainnet demo runs real xStocks via Jupiter
      </p>
    </div>
  );
}
