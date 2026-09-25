"use client";

import { useMemo } from "react";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { SolanaWalletConnectors } from "@dynamic-labs/solana";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import "@solana/wallet-adapter-react-ui/styles.css";

const RPC = "https://api.devnet.solana.com";
const ENVIRONMENT_ID =
  process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID?.trim() ||
  "1e1de74b-6a38-4a3c-82af-8f6369df62bb";

function SolanaProviders({ children }: { children: React.ReactNode }) {
  const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], []);
  return (
    <ConnectionProvider endpoint={RPC}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DynamicContextProvider
      theme="dark"
      settings={{
        environmentId: ENVIRONMENT_ID,
        walletConnectors: [SolanaWalletConnectors],
        appName: "Canopy",
        appLogoUrl: "/mark.svg",
        initialAuthenticationMode: "connect-only",
        shadowDOMEnabled: false,
      }}
    >
      <SolanaProviders>{children}</SolanaProviders>
    </DynamicContextProvider>
  );
}
