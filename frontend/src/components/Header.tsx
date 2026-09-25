"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import WalletButton from "./WalletButton";

const LINKS = [
  { href: "/markets", label: "PreStocks" },
  { href: "/instant", label: "Mint" },
  { href: "/sectors", label: "Group Vaults" },
];

export default function Header() {
  const pathname = usePathname();
  return (
    <header className="site-header">
      <div className="shell header-row">
      <Link href="/" className="brand-link" aria-label="Canopy home">
        <img src="/mark.svg" alt="" width={30} height={30} />
        <span>Canopy</span>
        <span className="network-pill"><i aria-hidden="true" />devnet</span>
      </Link>
      <nav className="primary-nav" aria-label="Primary navigation">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} aria-current={pathname.startsWith(l.href) ? "page" : undefined}>
            {l.label}
          </Link>
        ))}
      </nav>
      <WalletButton />
      </div>
    </header>
  );
}
