"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const landing = usePathname() === "/";
  return (
    <footer className={`site-footer ${landing ? "landing-footer" : "app-footer"}`}>
      <div className="shell footer-row">
        <div className="footer-brand">
          <img src="/mark.svg" alt="" width={36} height={36} />
          <div>
            <strong>CANOPY</strong>
            <p>{landing ? "Collectible claims on tokenized stocks." : "Markets, vaults, and your collection."}</p>
          </div>
        </div>
        <div className="footer-links" aria-label="Footer navigation">
          {landing ? <>
            <Link href="/app">Open app</Link>
            <Link href="/matter">DNA engine</Link>
            <a href="https://github.com/David-glitc/canopy">GitHub ↗</a>
          </> : <>
            <Link href="/">About Canopy</Link>
            <Link href="/markets">Markets</Link>
            <Link href="/profile">Portfolio</Link>
            <a href="https://explorer.solana.com/address/9xmniHhMGswjyMGf9jW7YCireJaUARBozRSDWYU1Jrnf?cluster=devnet">Program ↗</a>
          </>}
        </div>
      </div>
    </footer>
  );
}
