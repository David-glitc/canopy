import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchShare } from "@/lib/card-data";

type PageProps = {
  params: Promise<{ mint: string }>;
  searchParams: Promise<{ grove?: string; index?: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ mint: string }> }) {
  const { mint } = await params;
  return {
    title: `${mint.slice(0, 8)}… — Canopy Share`,
    description: "A Canopy cipher-key backed by tokenized equity.",
  };
}

export default async function SharePage({ params, searchParams }: PageProps) {
  const { mint } = await params;
  const { grove, index } = await searchParams;
  const share = await fetchShare(mint, grove, index);

  if (!share) notFound();

  const qs = grove && index ? `?grove=${grove}&index=${index}` : "";
  const revealed = Boolean(share.seedStr);
  const imageUrl = revealed ? `/api/cards/${mint}/image${qs}` : "";

  return (
    <div className="mx-auto grid min-h-screen max-w-6xl items-start gap-10 px-6 pb-28 pt-28 lg:grid-cols-[minmax(0,420px)_1fr] lg:pt-36">
      <div className="glass overflow-hidden rounded-2xl">
        {revealed ? (
          <img
            src={imageUrl}
            alt={share.name}
            className="aspect-[2/3] w-full object-cover"
          />
        ) : (
          <div className="flex aspect-[2/3] w-full flex-col items-center justify-center gap-4 bg-[#0d0d10]">
            <img src="/mark.svg" alt="" width={88} height={88} className="opacity-70" />
            <p className="font-mono2 text-sm tracking-[0.4em] text-[var(--canopy-green)]">SEALED</p>
          </div>
        )}
      </div>

      <div className="max-w-2xl">
        <Link href="/sectors" className="font-mono2 text-sm text-[var(--canopy-muted)] no-underline transition-colors hover:text-[var(--canopy-text)]">
          ← back to Sectors
        </Link>
        <p className="mt-8 font-mono2 text-sm tracking-[0.3em] text-[var(--canopy-green)]">
          CANOPY SHARE
        </p>
        <h1 className="font-display mt-3 text-4xl font-extrabold sm:text-5xl">
          {revealed ? share.name : "Sealed cipher-key"}
        </h1>
        <p className="mt-4 leading-relaxed text-[var(--canopy-muted)]">
          {revealed
            ? "This operative identity is derived from the assets and market history held by its Sector."
            : "The reveal seed is still locked. The claim remains sealed until its Sector completes reveal."}
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-[var(--canopy-line)] bg-black/40 p-4">
            <p className="font-mono2 text-sm tracking-[0.2em] text-[var(--canopy-muted)]">ECONOMIC RARITY</p>
            <p className="mt-1 font-display text-lg font-extrabold text-[var(--canopy-text)]">{share.economicRarity}</p>
          </div>
          <div className="rounded-xl border border-[var(--canopy-line)] bg-black/40 p-4">
            <p className="font-mono2 text-sm tracking-[0.2em] text-[var(--canopy-muted)]">STATUS</p>
            <p className="mt-1 font-display text-lg font-extrabold text-[var(--canopy-green)]">{revealed ? "Revealed" : "Locked"}</p>
          </div>
        </div>

        {revealed && (
          <div className="mt-8">
            <p className="font-mono2 text-sm tracking-[0.2em] text-[var(--canopy-muted)]">SIGNAL</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {Object.entries(share.attrs)
                .filter(([key]) => !["sealed", "revealed", "claimed", "deposit_lamports", "weight_1e18", "rarity", "dna", "instant"].includes(key))
                .slice(0, 8)
                .map(([key, value]) => (
                  <div key={key} className="rounded-xl border border-[var(--canopy-line)] bg-black/30 p-3">
                    <p className="font-mono2 text-[11px] uppercase text-[var(--canopy-muted)]">{key.replaceAll("_", " ")}</p>
                    <p className="mt-1 text-sm text-[var(--canopy-text)]">{value}</p>
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href={`/api/cards/${mint}/metadata${qs}`}
            className="btn-primary px-6 py-3 text-sm text-center"
          >
            View metadata
          </a>
          <Link href="/shop" className="btn-ghost px-6 py-3 text-sm text-center">
            Browse Shop
          </Link>
        </div>

        <p className="mt-6 break-all font-mono2 text-sm leading-relaxed text-[var(--canopy-muted)]">
          {mint}
        </p>
      </div>
    </div>
  );
}
