import Link from "next/link";

export const metadata = {
  title: "People",
  description: "Traits emerge from realized holdings and survived markets.",
};

export default function PeoplePage() {
  return (
    <div className="mx-auto max-w-6xl px-6 pb-24 pt-28">
      <p className="font-mono2 text-sm tracking-[0.3em] text-[var(--canopy-green)]">
        04 / PEOPLE
      </p>
      <h1 className="font-display mt-3 text-4xl font-extrabold sm:text-5xl">
        Identity is earned.
      </h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-[var(--canopy-muted)]">
        Traits emerge from realized holdings and survived markets — never
        from a raw dice roll. Every address carries a history the chain
        cannot forget.
      </p>
      <div className="mt-10 rounded-2xl border border-[var(--canopy-line)] bg-black/30 p-8">
        <p className="font-mono2 text-sm text-[var(--canopy-muted)]">
          Personas surface here once addresses have transacted on-chain. Connect a wallet to
          see your cipher-profile, or browse known addresses below.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { addr: "0x1a2b…", trait: "Sector Funder", survived: 3 },
            { addr: "0x3c4d…", trait: "Instant Minter", survived: 1 },
            { addr: "0x5e6f…", trait: "Cold Storage", survived: 12 },
          ].map((p) => (
            <Link
              key={p.addr}
              href={`/people/${p.addr}`}
              className="rounded-xl border border-[var(--canopy-line)] bg-black/40 p-4 no-underline transition-colors hover:border-[var(--canopy-green)]"
            >
              <p className="font-mono2 text-sm text-[var(--canopy-green)]">{p.trait}</p>
              <p className="mt-2 font-display text-base font-bold text-[var(--canopy-text)]">
                {p.addr}
              </p>
              <p className="mt-1 font-mono2 text-sm tabular text-[var(--canopy-muted)]">
                {p.survived} markets survived
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
