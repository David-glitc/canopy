"use client";

import dynamic from "next/dynamic";

const DynamicWalletWidget = dynamic(
  () => import("@dynamic-labs/sdk-react-core").then((module) => module.DynamicWidget),
  {
    ssr: false,
    loading: () => (
      <div className="btn-secondary pointer-events-none" aria-hidden="true">Connect wallet</div>
    ),
  }
);

export default function WalletButton() {
  return <DynamicWalletWidget />;
}
