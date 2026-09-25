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
  getSigner?: () => Promise<DynamicSolanaSigner>;
  connector?: {
    signTransaction?: (transaction: Transaction) => Promise<Transaction>;
    getSigner?: () => Promise<DynamicSolanaSigner | undefined>;
  };
};

type DynamicSolanaSigner = {
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
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
        const signers = opts?.signers ?? [];

        tx.feePayer = publicKey ?? undefined;
        if (!tx.recentBlockhash) {
          const { blockhash } = await conn.getLatestBlockhash();
          tx.recentBlockhash = blockhash;
        }
        if (signers.length) tx.partialSign(...signers);

        let signed: Transaction;
        if (primaryWallet.getSigner) {
          const signer = await primaryWallet.getSigner();
          signed = await signer.signTransaction(tx);
        } else if (primaryWallet.connector?.getSigner) {
          const signer = await primaryWallet.connector.getSigner();
          if (!signer) throw new Error("Dynamic could not load the Solana signer");
          signed = await signer.signTransaction(tx);
        } else if (primaryWallet.signTransaction) {
          signed = await primaryWallet.signTransaction(tx);
        } else if (primaryWallet.connector?.signTransaction) {
          signed = await primaryWallet.connector.signTransaction(tx);
        } else {
          throw new Error("Connected wallet does not support Solana transaction signing");
        }

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
