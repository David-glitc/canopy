import Link from "next/link";

export const metadata = {
  title: "Decision Markets",
  description: "PASS/FAIL markets for shared vault proposals on Solana devnet.",
};

export default function LeaderboardPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 pb-24 pt-28">
      <p className="font-mono2 text-sm tracking-[0.3em] text-[var(--canopy-green)]">
        DECISION MARKETS
      </p>
      <h1 className="font-display mt-3 text-4xl font-extrabold sm:text-5xl">
        Markets decide group changes.
      </h1>
      <p className="mt-4 max-w-2xl text-pretty leading-relaxed text-[var(--canopy-muted)]">
        Vault owners can open a PASS/FAIL market for a proposed change. The time-weighted market
        price decides the result.
      </p>
      <div className="glass mt-10 rounded-2xl p-8">
        <p className="font-semibold">No open decision markets.</p>
        <p className="mt-2 text-pretty text-sm text-[var(--canopy-muted)]">
          Open a group vault to inspect its proposal market state.
        </p>
        <Link href="/sectors" className="btn-primary mt-5">Open group vaults</Link>
      </div>
    </div>
  );
}
