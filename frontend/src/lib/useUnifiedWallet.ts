"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";

/**
 * Stable transaction surface backed directly by Solana Wallet Adapter.
 * Phantom and Solflare can connect without an external dashboard environment.
 */
export function useUnifiedWallet() {
  const { connection } = useConnection();
  const wallet = useWallet();

  return {
    publicKey: wallet.publicKey,
    connected: wallet.connected,
    connecting: wallet.connecting,
    disconnect: wallet.disconnect,
    sendTransaction: wallet.sendTransaction,
    connection,
    isDynamic: false,
    isAdapter: wallet.connected,
  };
}
