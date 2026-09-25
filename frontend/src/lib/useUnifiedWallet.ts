"use client";

import { useCallback } from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useConnection, useWallet as useAdapterWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction, type SendOptions, type Signer } from "@solana/web3.js";

type TransactionOptions = SendOptions & { signers?: Signer[] };

type DynamicSolanaSigner = {
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
};

type DynamicSolanaWallet = {
  address?: string;
  signTransaction?: (transaction: Transaction) => Promise<Transaction>;
  getSigner?: () => Promise<DynamicSolanaSigner>;
  connector?: {
    signTransaction?: (transaction: Transaction) => Promise<Transaction>;
    getSigner?: () => Promise<DynamicSolanaSigner | undefined>;
  };
};

function publicKeyFrom(address?: string) {
  if (!address) return null;
  try {
    return new PublicKey(address);
  } catch {
    return null;
  }
}

async function signWithDynamic(wallet: DynamicSolanaWallet, transaction: Transaction) {
  if (wallet.getSigner) return (await wallet.getSigner()).signTransaction(transaction);
  if (wallet.connector?.getSigner) {
    const signer = await wallet.connector.getSigner();
    if (signer) return signer.signTransaction(transaction);
  }
  if (wallet.signTransaction) return wallet.signTransaction(transaction);
  if (wallet.connector?.signTransaction) return wallet.connector.signTransaction(transaction);
  throw new Error("Connected wallet does not support Solana transaction signing");
}

/** Dynamic is primary. Wallet Adapter remains available as a fallback. */
export function useUnifiedWallet() {
  const { connection } = useConnection();
  const adapter = useAdapterWallet();
  const dynamic = useDynamicContext();
  const primaryWallet = (dynamic.primaryWallet ?? null) as DynamicSolanaWallet | null;
  const dynamicPublicKey = publicKeyFrom(primaryWallet?.address);
  const adapterPublicKey = adapter.connected ? adapter.publicKey : null;
  const publicKey = dynamicPublicKey ?? adapterPublicKey ?? null;

  const sendTransaction = useCallback(async (
    transaction: Transaction,
    conn = connection,
    options?: TransactionOptions,
  ) => {
    if (!publicKey) throw new Error("Connect a Solana wallet first");

    const { blockhash, lastValidBlockHeight } = await conn.getLatestBlockhash("confirmed");
    transaction.feePayer = publicKey;
    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;

    const signers = options?.signers ?? [];
    if (signers.length) transaction.partialSign(...signers);

    if (primaryWallet && dynamicPublicKey) {
      const signed = await signWithDynamic(primaryWallet, transaction);
      return conn.sendRawTransaction(signed.serialize(), {
        skipPreflight: options?.skipPreflight ?? false,
        maxRetries: options?.maxRetries,
        minContextSlot: options?.minContextSlot,
        preflightCommitment: options?.preflightCommitment,
      });
    }

    if (adapter.connected && adapter.sendTransaction) {
      return adapter.sendTransaction(transaction, conn, { ...options, signers: [] });
    }

    throw new Error("No compatible Solana wallet is connected");
  }, [adapter, connection, dynamicPublicKey, primaryWallet, publicKey]);

  return {
    publicKey,
    connected: Boolean(publicKey),
    connecting: adapter.connecting,
    disconnect: adapter.disconnect,
    sendTransaction,
    connection,
    isDynamic: Boolean(dynamicPublicKey),
    isAdapter: Boolean(adapterPublicKey),
  };
}
