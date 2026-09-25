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
    ["Canopy", CANOPY.toBase58(), "vaults, collectibles, refunds, and withdrawals"],
    ["Canopy Markets", FUTARCHY.toBase58(), "PASS/FAIL decision markets"],
  ];

  return (
    <div className="glass rounded-[1.5rem] p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold tracking-[-.025em]">Deployed programs</h3>
          <p className="mt-1 text-sm text-[var(--canopy-muted)]">Live checks from Solana devnet</p>
        </div>
        <span className="status">
          {slot === null ? "Checking" : `Slot ${slot.toLocaleString()}`}
        </span>
      </div>
      <div className="mt-6 overflow-hidden rounded-xl border border-[var(--canopy-line)]">
        {rows.map(([name, addr, desc], i) => (
          <div
            key={name}
            className="flex flex-col gap-3 bg-[var(--panel)] p-4 [&+&]:border-t [&+&]:border-[var(--canopy-line)] sm:flex-row sm:items-center sm:justify-between"
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
                <span className="text-sm font-bold">{name}</span>
              </div>
              <p className="mt-1 max-w-md text-xs leading-5 text-[var(--canopy-muted)]">
                {desc} · {addr.slice(0, 6)}…{addr.slice(-5)}
              </p>
            </div>
            <a
              className="text-xs font-bold text-[var(--canopy-green)] no-underline transition-colors hover:text-[var(--canopy-text)]"
              href={`https://explorer.solana.com/address/${addr}?cluster=devnet`}
              target="_blank"
              rel="noreferrer"
            >
              Open in Explorer ↗
            </a>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs leading-5 text-[var(--canopy-muted)]">
        Solana devnet · mock mUSDC · official PreStocks data · verified Pyth updates
      </p>
    </div>
  );
}
