"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import WalletButton from "./WalletButton";

const LINKS = [
  { href: "/sectors", label: "Sectors", match: "/sectors" },
  { href: "/instant", label: "Instant", match: "/instant" },
  { href: "/shop", label: "Shop", match: "/shop" },
  { href: "/#how", label: "How it works", match: "/#how" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header className="navbar fixed inset-x-0 top-0 z-50">
      <Link href="/" className="flex items-center gap-3 no-underline shrink-0">
        <img src="/mark.svg" alt="Canopy" width={28} height={28} className="rounded-full" />
        <span className="font-display text-[15px] font-extrabold tracking-[0.18em] text-[var(--color-text)]">CANOPY</span>
        <span className="status ml-1 hidden sm:inline-flex text-[10px]">Live • devnet</span>
      </Link>
      <nav className="hidden items-center gap-1 text-sm md:flex">
        {LINKS.map((l) => {
          const active = pathname === l.match || (l.match.startsWith("/#") && pathname === "/");
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-full px-3 py-1.5 font-medium no-underline transition-colors ${active ? "bg-[var(--color-primary-muted)] text-[var(--color-primary)] border border-[var(--color-primary)]/20" : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-white/[0.04]"}`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="flex items-center gap-2">
        <WalletButton />
        <button
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex size-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] md:hidden"
        >
          <span className="mono text-xs">{open ? "✕" : "≡"}</span>
        </button>
      </div>
      {open && (
        <div className="absolute inset-x-0 top-[72px] border-t border-[var(--color-border)] bg-[var(--color-bg)] p-4 md:hidden">
          <nav className="grid gap-1">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 font-medium text-[var(--color-text)] no-underline hover:bg-[var(--color-surface)] border border-transparent hover:border-[var(--color-border)]"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
