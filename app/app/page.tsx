import ProgramStatus from "./components/ProgramStatus";

const TRACKS = [
  {
    id: "sectors",
    kicker: "01 / SECTORS",
    title: "Fund a Sector. Pull a cipher.",
    body: "Sectors pool capital into tokenized stocks and pre-IPO names. Every funder mints a sealed Share — a cipher-key that reveals into a deterministic operative with real backing.",
    cta: "Sectors coming online",
  },
  {
    id: "instant",
    kicker: "02 / INSTANT",
    title: "Solo pull. Instant reveal.",
    body: "From $1.50: your own micro-vault, minted and revealed in one transaction. Same engine, same real backing, zero waiting. Fee 1% to the treasury.",
    cta: "/instant",
  },
  {
    id: "shop",
    kicker: "03 / SHOP",
    title: "Trade cipher-keys.",
    body: "Revealed Shares trade with their claim attached. History compounds on-chain — crash survivors and cold-storage keys carry their scars in the open.",
    cta: "/shop",
  },
];

export default function Home() {
  return (
    <div id="top">
      {/* HERO */}
      <section className="grid-bg relative overflow-hidden pt-16">
        <div className="orb left-1/2 top-[-180px] h-[420px] w-[720px] -translate-x-1/2 bg-[var(--canopy-green)] opacity-[0.08]" />
        <div className="orb left-[8%] top-[38%] h-[300px] w-[300px] bg-[var(--canopy-green)] opacity-[0.06]" />
        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-20 text-center sm:pt-28">
          <img
            src="/mark.svg"
            alt="Canopy cipher mark"
            width={120}
            height={120}
            className="mx-auto opacity-90"
          />
          <p className="mt-8 font-mono2 text-sm tracking-[0.35em] text-[var(--canopy-green)]">
            A TECHNOCRATIC CIPHER-SOCIETY FOR TOKENIZED EQUITY
          </p>
          <h1 className="font-display mx-auto mt-5 max-w-4xl text-5xl font-extrabold leading-[1.1] sm:text-7xl">
            COLLECT STOCKS
            <br />
            LIKE CIPHER-KEYS.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[var(--canopy-muted)] sm:text-lg">
            Fund a Sector. Mint a sealed Share. Reveal how much of the vault
            you own — then govern it by market, not by whales. Chrome,
            signal, math.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="#instant" className="btn-primary px-8 py-3.5 text-sm">
              Mint Instant — $1.50
            </a>
            <a href="#sectors" className="btn-ghost px-8 py-3.5 text-sm">
              Explore Sectors
            </a>
          </div>
          <div className="mx-auto mt-14 max-w-3xl text-left">
            <ProgramStatus />
          </div>
        </div>
      </section>

      {/* TRACKS */}
      {TRACKS.map((t) => (
        <section key={t.id} id={t.id} className="border-t border-[var(--canopy-line)]">
          <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
            <p className="font-mono2 text-sm tracking-[0.3em] text-[var(--canopy-green)]">
              {t.kicker}
            </p>
            <h2 className="font-display mt-3 max-w-2xl text-3xl font-extrabold sm:text-4xl">
              {t.title}
            </h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-[var(--canopy-muted)]">
              {t.body}
            </p>
            {typeof t.cta === "string" && t.cta.startsWith("/") ? (
              <a href={t.cta} className="mt-6 inline-block rounded-full border border-[var(--canopy-line)] px-4 py-1.5 font-mono2 text-sm text-[var(--canopy-muted)] no-underline transition-colors hover:border-[var(--canopy-green)] hover:text-[var(--canopy-text)]">
                {t.cta === "/shop" ? "Enter Shop" : t.cta}
              </a>
            ) : (
              <span className="mt-6 inline-block rounded-full border border-[var(--canopy-line)] px-4 py-1.5 font-mono2 text-sm text-[var(--canopy-muted)]">
                {t.cta}
              </span>
            )}
          </div>
        </section>
      ))}

      {/* DOCTRINE */}
      <section id="doctrine" className="border-t border-[var(--canopy-line)] bg-[var(--canopy-ink)]">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <p className="font-mono2 text-sm tracking-[0.3em] text-[var(--canopy-green)]">
            DOCTRINE
          </p>
          <blockquote className="font-display mt-4 max-w-3xl text-2xl font-bold leading-snug sm:text-3xl">
            “Every deposit mints a cipher. Every cipher stays backed.
            The asset is liquid. The key is true.”
          </blockquote>
          <div className="mt-8 grid gap-4 text-sm text-[var(--canopy-muted)] sm:grid-cols-3">
            <div className="glass rounded-2xl p-5">
              Capital decides. Proposals open bonded pass/fail markets; the
              time-weighted price rules. Silence keeps the status quo.
            </div>
            <div className="glass rounded-2xl p-5">
              Identity is earned. Traits emerge from realized holdings and
              survived markets — never from a raw dice roll.
            </div>
            <div className="glass rounded-2xl p-5">
              Claims are real. Burn the key or hold it; the vault pays
              pro-rata, on-chain, without permission.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
