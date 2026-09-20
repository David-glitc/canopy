"use client";

import { useContext, useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { SolanaWalletConnectors } from "@dynamic-labs/solana";
import { FlagContext } from "@/lib/providerFlag";
import "@solana/wallet-adapter-react-ui/styles.css";

const RPC = "https://api.devnet.solana.com";
const ENV_ID = process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID ?? "1e1de74b-6a38-4a3c-82af-8f6369df62bb";

function Inner({ children }: { children: React.ReactNode }) {
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
  const already = useContext(FlagContext);
  if (already) return <Inner>{children}</Inner>;
  return (
    <FlagContext.Provider value={true}>
      <DynamicContextProvider settings={{ environmentId: ENV_ID, walletConnectors: [SolanaWalletConnectors] }}>
        <Inner>{children}</Inner>
      </DynamicContextProvider>
    </FlagContext.Provider>
  );
}
