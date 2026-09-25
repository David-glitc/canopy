"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

export default function WalletButton() {
  const { publicKey, connected, connecting, disconnect } = useWallet();
  const { setVisible } = useWalletModal();

  if (connected && publicKey) {
    const address = publicKey.toBase58();
    return <button type="button" className="wallet-trigger" onClick={() => void disconnect()}>{address.slice(0, 4)}··{address.slice(-4)}</button>;
  }

  return <button type="button" className="wallet-trigger" onClick={() => setVisible(true)} disabled={connecting}>{connecting ? "Connecting…" : "Connect wallet"}</button>;
}
