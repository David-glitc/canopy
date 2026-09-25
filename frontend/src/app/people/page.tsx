import Link from "next/link";

export const metadata = {
  title: "Wallets",
  description: "View wallet activity recorded by Canopy on Solana devnet.",
};

export default function PeoplePage() {
  return (
    <div className="shell pb-24 pt-16 sm:pt-24">
      <p className="page-kicker">Wallets</p>
      <h1 className="page-title">Public portfolios.</h1>
      <p className="page-lede">Open any Canopy wallet to inspect its mints, vault shares, reveal status, NAV, and XP.</p>
      <div className="glass mt-10 rounded-2xl p-8">
        <p className="font-semibold">Connect a wallet to open its portfolio.</p>
        <p className="mt-2 text-pretty text-sm text-[var(--canopy-muted)]">
          Your profile appears as soon as Canopy finds a position owned by the connected address.
        </p>
        <Link href="/profile" className="btn-primary mt-5">Open my portfolio</Link>
      </div>
    </div>
  );
}
