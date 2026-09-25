"use client";
import { useCallback } from "react";
import { useConnection, useWallet as useAdapterWallet } from "@solana/wallet-adapter-react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import {
  PublicKey,
  Transaction,
  type SendOptions,
  type Signer,
} from "@solana/web3.js";

type DynamicSolanaWallet = {
  address?: string;
  chain?: string;
  signTransaction?: (transaction: Transaction) => Promise<Transaction>;
  connector?: {
    signTransaction?: (transaction: Transaction) => Promise<Transaction>;
  };
};

function parsePublicKey(address?: string) {
  if (!address) return null;
  try {
    return new PublicKey(address);
  } catch {
    return null;
  }
}

/**
 * Unified wallet hook that prefers Dynamic (if connected) then falls back to wallet-adapter.
 * Keeps existing sendTransaction / publicKey / connected shape so InstantMint & SectorDetail stay simple.
 */
export function useUnifiedWallet() {
  const { connection } = useConnection();
  const adapter = useAdapterWallet();
  const dynamic = useDynamicContext();

  const primaryWallet = (dynamic.primaryWallet ?? null) as DynamicSolanaWallet | null;
  const dynamicPk = parsePublicKey(primaryWallet?.address);

  const isDynamicConnected = !!primaryWallet?.address && !!primaryWallet?.chain;
  const isAdapterConnected = adapter.connected && !!adapter.publicKey;

  const publicKey = dynamicPk ?? adapter.publicKey ?? null;
  const connected = isDynamicConnected || isAdapterConnected;

  const sendTransaction = useCallback(
    async (tx: Transaction, conn = connection, opts?: SendOptions & { signers?: Signer[] }) => {
      // Prefer adapter if it is connected — it already knows how to sign + send with wallet-adapter
      if (isAdapterConnected && adapter.sendTransaction) {
        return adapter.sendTransaction(tx, conn, opts);
      }
      // Fallback: Dynamic Solana wallet
      if (primaryWallet) {
        // Dynamic Solana wallets expose signTransaction / signAllTransactions via the connector
        // Try a few shapes to stay compatible across @dynamic-labs/solana versions
        const signers = opts?.signers ?? [];

        tx.feePayer = publicKey ?? undefined;
        if (!tx.recentBlockhash) {
          const { blockhash } = await conn.getLatestBlockhash();
          tx.recentBlockhash = blockhash;
        }
        if (signers.length) tx.partialSign(...signers);

        // If wallet has a direct signTransaction, use it then send via connection
        // The generic flow: sign with Dynamic, add extra signers, sendRaw
        let signed = tx;
        const maybeSign = primaryWallet.signTransaction ?? primaryWallet.connector?.signTransaction;
        if (maybeSign) {
          signed = await maybeSign(tx);
        }

        // If we signed via Dynamic, send raw; otherwise fallback to adapter send
        try {
          const raw = signed.serialize();
          const sig = await conn.sendRawTransaction(raw, { skipPreflight: false });
          await conn.confirmTransaction(sig, "confirmed");
          return sig;
        } catch (e) {
          // last resort: try adapter send
          if (adapter.sendTransaction) return adapter.sendTransaction(tx, conn, opts);
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
