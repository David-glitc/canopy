import Link from "next/link";

export const metadata = {
  title: "Wallets",
  description: "View wallet activity recorded by Canopy on Solana devnet.",
};

export default function PeoplePage() {
  return (
    <div className="mx-auto max-w-6xl px-6 pb-24 pt-28">
      <p className="font-mono2 text-sm tracking-[0.3em] text-[var(--canopy-green)]">
        WALLETS
      </p>
      <h1 className="font-display mt-3 text-4xl font-extrabold sm:text-5xl">
        Wallet activity.
      </h1>
      <p className="mt-4 max-w-2xl text-pretty leading-relaxed text-[var(--canopy-muted)]">
        This page will list wallets that mint collectibles or join decision markets on devnet.
      </p>
      <div className="mt-10 rounded-2xl border border-[var(--canopy-line)] bg-black/30 p-8">
        <p className="font-semibold">No wallet profiles yet.</p>
        <p className="mt-2 text-pretty text-sm text-[var(--canopy-muted)]">
          Mint a collectible to create the first activity record.
        </p>
        <Link href="/markets" className="btn-primary mt-5">Choose a PreStock</Link>
      </div>
    </div>
  );
}
