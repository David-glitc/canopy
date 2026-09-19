"use client";
import { useCallback, useMemo } from "react";
import { useConnection, useWallet as useAdapterWallet } from "@solana/wallet-adapter-react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { PublicKey, Transaction } from "@solana/web3.js";

/**
 * Unified wallet hook that prefers Dynamic (if connected) then falls back to wallet-adapter.
 * Keeps existing sendTransaction / publicKey / connected shape so InstantMint & SectorDetail stay simple.
 */
export function useUnifiedWallet() {
  const { connection } = useConnection();
  const adapter = useAdapterWallet();
  const dynamic = useDynamicContext();

  const primaryWallet: any = (dynamic as any)?.primaryWallet ?? null;

  const dynamicPk = useMemo(() => {
    try {
      if (primaryWallet?.address) return new PublicKey(primaryWallet.address);
    } catch {}
    return null;
  }, [primaryWallet?.address]);

  const isDynamicConnected = !!primaryWallet?.address && !!primaryWallet?.chain;
  const isAdapterConnected = adapter.connected && !!adapter.publicKey;

  const publicKey = dynamicPk ?? adapter.publicKey ?? null;
  const connected = isDynamicConnected || isAdapterConnected;

  const sendTransaction = useCallback(
    async (tx: Transaction, conn = connection, opts?: { signers?: any[] }) => {
      // Prefer adapter if it is connected — it already knows how to sign + send with wallet-adapter
      if (isAdapterConnected && adapter.sendTransaction) {
        return adapter.sendTransaction(tx, conn, opts as any);
      }
      // Fallback: Dynamic Solana wallet
      if (primaryWallet) {
        // Dynamic Solana wallets expose signTransaction / signAllTransactions via the connector
        // Try a few shapes to stay compatible across @dynamic-labs/solana versions
        const signers = (opts as any)?.signers ?? [];

        // If wallet has a direct signTransaction, use it then send via connection
        // The generic flow: sign with Dynamic, add extra signers, sendRaw
        let signed = tx;
        // Try wallet-level sign
        const maybeSign = (primaryWallet as any).signTransaction ?? (primaryWallet as any).connector?.signTransaction;
        if (maybeSign) {
          // some connectors expect the wallet to sign, then we add extra signers
          try {
            signed = await maybeSign.call(primaryWallet, tx);
          } catch {}
        }
        // Add extra signers (e.g. new asset Keypair for Core mint)
        if (signers.length) {
          signed.partialSign(...signers);
        } else if ((primaryWallet as any).address) {
          // ensure fee payer
          signed.feePayer = publicKey!;
          const { blockhash, lastValidBlockHeight } = await conn.getLatestBlockhash();
          signed.recentBlockhash = blockhash;
        }

        // If we signed via Dynamic, send raw; otherwise fallback to adapter send
        try {
          const raw = signed.serialize();
          const sig = await conn.sendRawTransaction(raw, { skipPreflight: false });
          await conn.confirmTransaction(sig, "confirmed");
          return sig;
        } catch (e) {
          // last resort: try adapter send
          if (adapter.sendTransaction) return adapter.sendTransaction(tx, conn, opts as any);
          throw e;
        }
      }
      // No wallet
      throw new Error("No wallet connected");
    },
    [adapter, connection, isAdapterConnected, primaryWallet, publicKey]
  );

  return { publicKey, connected, sendTransaction, connection, isDynamic: isDynamicConnected, isAdapter: isAdapterConnected };
}
