import Link from "next/link";

export const metadata = {
  title: "Persona",
  description: "Cipher-profile for a known address.",
};

export default function PersonaPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 pb-24 pt-28">
      <Link href="/people" className="font-mono2 text-sm text-[var(--canopy-muted)] no-underline transition-colors hover:text-[var(--canopy-text)]">
        ← back to People
      </Link>
      <h1 className="font-display mt-8 text-4xl font-extrabold sm:text-5xl">
        Cipher-profile
      </h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-[var(--canopy-muted)]">
        Persona details surface here once on-chain history is analyzed.
        Traits, holdings, and survival metrics populate as the address
        interacts with Canopy markets.
      </p>
    </div>
  );
}
