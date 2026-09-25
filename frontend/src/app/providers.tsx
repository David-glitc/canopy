"use client";

import { useMemo } from "react";
import { DynamicContextProvider, overrideNetworkRpcUrl } from "@dynamic-labs/sdk-react-core";
import { SolanaWalletConnectorsWithConfig } from "@dynamic-labs/solana";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import "@solana/wallet-adapter-react-ui/styles.css";

const RPC = process.env.NEXT_PUBLIC_SOLANA_RPC_URL?.trim() || "https://api.devnet.solana.com";
const SOLANA_DEVNET = {
  blockExplorerUrls: ["https://explorer.solana.com/?cluster=devnet"],
  chainId: "103",
  cluster: "devnet",
  genesisHash: "EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
  iconUrls: ["https://app.dynamic.xyz/assets/networks/solana.svg"],
  isTestnet: true,
  key: "solana",
  name: "Solana Devnet",
  nativeCurrency: {
    decimals: 9,
    iconUrl: "https://app.dynamic.xyz/assets/networks/solana.svg",
    name: "Solana",
    pricingProviderTokenId: "solana",
    symbol: "SOL",
  },
  networkId: "103",
  rpcUrls: [RPC],
};
const solanaConnectors = SolanaWalletConnectorsWithConfig({
  commitment: "confirmed",
  customRpcUrls: { solana: [RPC] },
});
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
        walletConnectors: [solanaConnectors],
        overrides: { solNetworks: overrideNetworkRpcUrl([SOLANA_DEVNET], { "103": [RPC] }) },
        appName: "Canopy",
        appLogoUrl: "/mark.svg",
        initialAuthenticationMode: "connect-only",
        networkValidationMode: "always",
        shadowDOMEnabled: false,
      }}
    >
      <SolanaProviders>{children}</SolanaProviders>
    </DynamicContextProvider>
  );
}
