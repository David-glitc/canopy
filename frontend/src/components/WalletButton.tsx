"use client";

import { DynamicWidget } from "@dynamic-labs/sdk-react-core";

export default function WalletButton() {
  return (
    <div className="wallet-control">
      <DynamicWidget
        buttonClassName="wallet-trigger"
        buttonContainerClassName="wallet-trigger-wrap"
        innerButtonComponent={
          <span className="wallet-trigger-label">
            Connect wallet
            <span className="wallet-trigger-icon" aria-hidden="true">
              <svg viewBox="0 0 16 16" fill="none">
                <path d="M3.5 8h9M9 4.5 12.5 8 9 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </span>
        }
      />
    </div>
  );
}
