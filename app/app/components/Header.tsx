import WalletButton from "./WalletButton";

const LINKS = [
  { href: "#sectors", label: "Sectors" },
  { href: "#instant", label: "Instant" },
  { href: "#shop", label: "Shop" },
  { href: "#doctrine", label: "Doctrine" },
];

export default function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--canopy-line)] bg-[rgba(5,5,5,0.78)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <a href="#top" className="flex items-center gap-3">
          <img src="/mark.svg" alt="Canopy mark" width={30} height={30} />
          <span className="font-display text-lg font-extrabold tracking-[0.22em]">
            CANOPY
          </span>
        </a>
        <nav className="hidden items-center gap-7 text-sm text-[var(--canopy-muted)] md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="transition-colors hover:text-[var(--canopy-text)]">
              {l.label}
            </a>
          ))}
        </nav>
        <WalletButton />
      </div>
    </header>
  );
}
