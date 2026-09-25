"use client";

import dynamic from "next/dynamic";

const DynamicWalletWidget = dynamic(
  () => import("@dynamic-labs/sdk-react-core").then((module) => module.DynamicWidget),
  {
    ssr: false,
    loading: () => (
      <div className="h-10 w-36 animate-pulse rounded-xl bg-[var(--canopy-panel)]" aria-hidden="true" />
    ),
  }
);

export default function WalletButton() {
  return <DynamicWalletWidget />;
}
