import Link from "next/link";

export const metadata = {
  title: "Wallet Activity",
  description: "Canopy activity for a Solana devnet wallet.",
};

export default async function PersonaPage({ params }: { params: Promise<{ addr: string }> }) {
  const { addr } = await params;
  return (
    <div className="mx-auto max-w-6xl px-6 pb-24 pt-28">
      <Link href="/people" className="font-mono2 text-sm text-[var(--canopy-muted)] no-underline transition-colors hover:text-[var(--canopy-text)]">
        ← back to wallets
      </Link>
      <h1 className="font-display mt-8 text-4xl font-extrabold sm:text-5xl">
        Wallet activity
      </h1>
      <p className="mt-4 break-all font-mono text-sm text-[var(--canopy-green)]">{addr}</p>
      <p className="mt-4 max-w-2xl text-pretty leading-relaxed text-[var(--canopy-muted)]">
        No Canopy activity has been indexed for this devnet wallet yet.
      </p>
      <Link href="/markets" className="btn-primary mt-6">Choose a market</Link>
    </div>
  );
}
