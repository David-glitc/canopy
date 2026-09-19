"use client";

import { useEffect, useState } from "react";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";

export default function WalletButton() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return <div className="h-10 w-36 animate-pulse rounded-xl bg-[var(--canopy-panel)]" aria-hidden="true" />;
  }
  return <DynamicWidget />;
}
