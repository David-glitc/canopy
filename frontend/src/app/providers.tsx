"use client";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { SolanaWalletConnectors } from "@dynamic-labs/solana";
import { ConnectionProvider } from "@solana/wallet-adapter-react";
import { useMemo } from "react";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";

const RPC = "https://api.devnet.solana.com";
const ENV_ID =
  process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID?.trim() ||
  "1e1de74b-6a38-4a3c-82af-8f6369df62bb";

function WalletProviders({ children }: { children: React.ReactNode }) {
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
        environmentId: ENV_ID,
        walletConnectors: [SolanaWalletConnectors],
        appName: "Canopy",
        appLogoUrl: "/mark.svg",
        initialAuthenticationMode: "connect-only",
        shadowDOMEnabled: false,
      }}
    >
      <WalletProviders>{children}</WalletProviders>
    </DynamicContextProvider>
  );
}
