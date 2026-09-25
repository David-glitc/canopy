"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import WalletButton from "./WalletButton";

const LINKS = [
  { href: "/markets", label: "PreStocks" },
  { href: "/instant", label: "Mint" },
  { href: "/sectors", label: "Group Vaults" },
  { href: "/matter", label: "DNA" },
  { href: "/leaderboard", label: "XP" },
];

export default function Header() {
  const pathname = usePathname();
  return (
    <header className="site-header">
      <div className="shell header-row">
        <Link href="/" className="brand-link" aria-label="Canopy home">
          <span className="brand-mark">
            <img src="/mark.svg" alt="" width={30} height={30} />
          </span>
          <span className="brand-copy">
            <strong>Canopy</strong>
            <small>Private markets, collected</small>
          </span>
        </Link>
        <nav className="primary-nav" aria-label="Primary navigation">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} aria-current={pathname.startsWith(l.href) ? "page" : undefined}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <span className="network-pill"><i aria-hidden="true" />Solana devnet</span>
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
