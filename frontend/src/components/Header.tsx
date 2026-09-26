"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import WalletButton from "./WalletButton";
import PwaInstall from "./PwaInstall";

type NavIcon = "explore" | "create" | "vaults" | "collection" | "rankings";

const LINKS: { href: string; label: string; icon: NavIcon }[] = [
  { href: "/markets", label: "Explore", icon: "explore" },
  { href: "/instant", label: "Create", icon: "create" },
  { href: "/sectors", label: "Vaults", icon: "vaults" },
  { href: "/profile", label: "Portfolio", icon: "collection" },
  { href: "/leaderboard", label: "Rankings", icon: "rankings" },
];

function Icon({ name }: { name: NavIcon }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      {name === "explore" && <><circle cx="10" cy="10" r="7" /><path d="m12.7 7.3-1.5 3.9-3.9 1.5 1.5-3.9 3.9-1.5Z" /></>}
      {name === "create" && <><rect x="3.5" y="3.5" width="13" height="13" rx="3" /><path d="M10 6.7v6.6M6.7 10h6.6" /></>}
      {name === "vaults" && <><path d="M3.5 7.2 10 3.5l6.5 3.7v7.3a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2V7.2Z" /><path d="M7.2 16.5v-5h5.6v5M3.5 7.2h13" /></>}
      {name === "collection" && <><rect x="4" y="3" width="10" height="13" rx="2" /><path d="M7 6h7a2 2 0 0 1 2 2v7" /><path d="m7 11 1.8-2 2.4 2.7 1.3-1.2 1.5 1.6" /></>}
      {name === "rankings" && <><path d="M3.5 16.5h13M4.5 16.5v-5h3v5M8.5 16.5V7h3v9.5M12.5 16.5V9.5h3v7" /><path d="m10 2.8.8 1.6 1.8.3-1.3 1.2.3 1.8L10 6.9l-1.6.8.3-1.8-1.3-1.2 1.8-.3.8-1.6Z" /></>}
    </svg>
  );
}

export default function Header() {
  const pathname = usePathname();
  if (pathname === "/") {
    return (
      <header className="site-header landing-header">
        <div className="shell header-row">
          <Link href="/" className="brand-link" aria-label="Canopy home">
            <span className="brand-mark"><img src="/mark.svg" alt="" width={30} height={30} /></span>
            <span className="brand-copy"><strong>CANOPY</strong></span>
          </Link>
          <nav className="landing-nav" aria-label="Website navigation">
            <Link href="/markets">Stocks</Link>
            <Link href="/sectors">Vaults</Link>
            <a href="#how">How it works</a>
          </nav>
          <div className="landing-header-actions">
            <details className="landing-menu">
              <summary aria-label="Open navigation">
                <span></span><span></span>
              </summary>
              <nav aria-label="Mobile website navigation">
                <Link href="/markets"><span>01</span> Stocks</Link>
                <Link href="/sectors"><span>02</span> Vaults</Link>
                <a href="#how"><span>03</span> How it works</a>
              </nav>
            </details>
            <Link href="/app" className="btn-primary landing-launch">Enter app <span>↗</span></Link>
          </div>
        </div>
      </header>
    );
  }
  return (
    <header className="site-header app-header">
      <div className="shell header-row">
        <Link href="/app" className="brand-link" aria-label="Canopy app home">
          <span className="brand-mark"><img src="/mark.svg" alt="" width={30} height={30} /></span>
          <span className="brand-copy"><strong>CANOPY</strong><small>APP</small></span>
        </Link>
        <nav className="primary-nav" aria-label="Primary navigation">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} aria-current={pathname.startsWith(link.href) ? "page" : undefined}>
              <span className="nav-icon"><Icon name={link.icon} /></span>
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>
        <div className="header-actions"><PwaInstall /><WalletButton /></div>
      </div>
    </header>
  );
}
