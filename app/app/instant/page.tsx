import InstantMint from "../components/InstantMint";

export const metadata = {
  title: "Instant Mint — Canopy",
  description: "Solo pull. Instant reveal. Real backing.",
};

export default function InstantPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 pb-24 pt-28">
      <p className="font-mono2 text-xs tracking-[0.3em] text-[var(--canopy-green)]">
        02 / INSTANT
      </p>
      <h1 className="font-display mt-3 text-4xl font-extrabold sm:text-5xl">
        Solo pull. <span className="text-gradient">Instant reveal.</span>
      </h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-[var(--canopy-muted)]">
        Your own micro-vault, minted and revealed in one transaction. 1% to
        the treasury. Same engine, same real backing, zero waiting.
      </p>
      <div className="mt-10">
        <InstantMint />
      </div>
    </div>
  );
}
