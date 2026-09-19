import WalletButton from "./WalletButton";

const LINKS = [
  { href: "#sectors", label: "Sectors" },
  { href: "#instant", label: "Instant" },
  { href: "/shop", label: "Shop" },
  { href: "#doctrine", label: "Doctrine" },
];

export default function Header() {
  return (
    <header className="navbar fixed inset-x-0 top-0 z-50">
      <a href="#top" className="flex items-center gap-3 no-underline">
        <img src="/mark.svg" alt="Canopy mark" width={28} height={28} />
        <span className="font-display text-lg font-extrabold tracking-[0.22em] text-[var(--color-text)]">CANOPY</span>
        <span className="status ml-2 hidden sm:inline-flex">Live</span>
      </a>
      <nav className="hidden items-center gap-6 text-sm md:flex">
        {LINKS.map((l) => (
          <a key={l.href} href={l.href} className="font-medium text-[var(--color-text-secondary)] no-underline hover:text-[var(--color-primary)]">
            {l.label}
          </a>
        ))}
      </nav>
      <WalletButton />
    </header>
  );
}
