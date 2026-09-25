"use client";

import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

export default function WalletButton() {
  const { publicKey, connected, connecting, disconnect } = useWallet();
  const { setVisible } = useWalletModal();

  if (connected && publicKey) {
    const address = publicKey.toBase58();
    return (
      <div className="wallet-session">
        <Link href="/profile" className="wallet-profile-trigger" title="Open your inventory">
          <span className="wallet-avatar">{address.slice(0, 2)}</span>
          <span className="wallet-profile-copy">
            <strong>{address.slice(0, 4)}··{address.slice(-4)}</strong>
            <small>Inventory</small>
          </span>
        </Link>
        <button type="button" className="wallet-disconnect" onClick={() => void disconnect()} aria-label="Disconnect wallet">×</button>
      </div>
    );
  }

  return (
    <div className="wallet-control">
      <button type="button" className="wallet-trigger" onClick={() => setVisible(true)} disabled={connecting}>
        <span className="wallet-trigger-label">
          {connecting ? "Connecting…" : "Connect wallet"}
          <span className="wallet-trigger-icon" aria-hidden="true">
            <svg viewBox="0 0 16 16" fill="none">
              <path d="M3.5 8h9M9 4.5 12.5 8 9 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </span>
      </button>
    </div>
  );
}
