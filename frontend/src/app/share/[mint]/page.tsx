import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchShare } from "@/lib/card-data";
import DnaSnake from "@/components/DnaSnake";
import CompanyLogo from "@/components/CompanyLogo";

type PageProps = {
  params: Promise<{ mint: string }>;
  searchParams: Promise<{ grove?: string; index?: string; asset?: string; contract?: string; source?: string; price?: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ mint: string }> }) {
  const { mint } = await params;
  return {
    title: `${mint.slice(0, 8)}… Share`,
    description: "A Canopy collectible assembled from verifiable onchain DNA.",
  };
}

export default async function SharePage({ params, searchParams }: PageProps) {
  const { mint } = await params;
  const query = await searchParams;
  const { grove, index } = query;
  const share = await fetchShare(mint, grove, index);

  if (!share) notFound();

  const qs = grove && index ? `?grove=${grove}&index=${index}` : "";
  const revealed = Boolean(share.seedStr);
  const imageUrl = revealed ? `/api/cards/${mint}/image${qs}` : "";
  const queryPrice = Number(query.price);
  const position = share.position ?? (query.asset && query.contract ? {
    symbol: query.asset.slice(0, 24).toUpperCase(),
    mint: query.contract.slice(0, 64),
    source: query.source === "xStocks" ? "xStocks" as const : "PreStocks" as const,
    referencePrice: Number.isFinite(queryPrice) && queryPrice > 0 ? queryPrice : null,
    weight: 100,
  } : null);
  const tokenSet = share.tokenSet.length > 0 ? share.tokenSet : position ? [position] : [];

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
          <div className="flex aspect-[2/3] w-full items-center justify-center bg-[#0d0d10] p-5">
            <DnaSnake />
          </div>
        )}
      </div>

      <div className="max-w-2xl">
        <Link href="/sectors" className="font-mono2 text-sm text-[var(--canopy-muted)] no-underline transition-colors hover:text-[var(--canopy-text)]">
          ← back to group vaults
        </Link>
        <p className="mt-8 font-mono2 text-sm tracking-[0.06em] text-[var(--canopy-green)]">
          CANOPY SHARE
        </p>
        <h1 className="font-display mt-3 text-4xl font-bold sm:text-5xl">
          {revealed ? share.name : "Sealed collectible"}
        </h1>
        <p className="mt-4 leading-relaxed text-[var(--canopy-muted)]">
          {revealed
            ? "This form was assembled at request time from the collectible's on-chain DNA. It is reproducible, but was never selected from a preminted image set."
            : "No final image exists yet. The collectible stays sealed until its group vault commits reveal entropy."}
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-[var(--canopy-line)] bg-[var(--panel)] p-4">
            <p className="font-mono2 text-sm tracking-[0.04em] text-[var(--canopy-muted)]">ECONOMIC RARITY</p>
            <p className="mt-1 font-display text-lg font-bold text-[var(--canopy-text)]">{share.economicRarity}</p>
          </div>
          <div className="rounded-xl border border-[var(--canopy-line)] bg-[var(--panel)] p-4">
            <p className="font-mono2 text-sm tracking-[0.04em] text-[var(--canopy-muted)]">STATUS</p>
            <p className="mt-1 font-display text-lg font-bold text-[var(--canopy-green)]">{revealed ? "Revealed" : "Locked"}</p>
          </div>
        </div>

        {tokenSet.length > 0 && (
          <section className="position-record" aria-labelledby="position-record-title">
            <div className="position-record-head">
              <div>
                <p className="font-mono2 text-sm tracking-[0.04em] text-[var(--canopy-muted)]">TOKEN SET</p>
                <h2 id="position-record-title">What this Share points to</h2>
              </div>
              <span className="position-weight">{tokenSet.length === 1 ? `${tokenSet[0].weight}% target` : `${tokenSet.length} tokens`}</span>
            </div>
            <div className="position-token-set">
              {tokenSet.map((token) => <div className="position-token" key={token.mint}>
                <CompanyLogo symbol={token.symbol} name={token.symbol} className="position-token-logo" />
                <div className="min-w-0 flex-1">
                  <strong>{token.symbol}</strong>
                  <span>{token.source}{token.referencePrice ? ` · $${token.referencePrice.toFixed(2)} reference` : ""}</span>
                </div>
                <b>{token.weight.toFixed(token.weight % 1 ? 2 : 0)}%</b>
                <a href={`https://solscan.io/token/${token.mint}`} target="_blank" rel="noreferrer">Verify ↗</a>
              </div>)}
            </div>
            <div className="position-allocation" aria-label="Target token allocation">
              {tokenSet.map((token, tokenIndex) => <span key={token.mint} style={{ width: `${token.weight}%`, opacity: 1 - tokenIndex * 0.11 }} />)}
            </div>
            <div className="position-ledger">
              <span>Token target <strong>{tokenSet.map((token) => token.symbol).join(" · ")}</strong></span>
              <span>Held in vault <strong>mUSDC</strong></span>
            </div>
            <p className="position-truth">This Share records a claim on the vault. The token set above is its signed allocation target; the current vault still holds mUSDC until basket execution is added to the program.</p>
          </section>
        )}

        {revealed && (
          <div className="mt-8">
            <div className="share-dna-head">
              <p className="font-mono2 text-sm tracking-[0.04em] text-[var(--canopy-muted)]">DIGITAL MATTER GENOME</p>
              <span>{share.matterDna}</span>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {share.matterTraits
                .filter((trait) => trait.trait_type !== "Economic Rarity")
                .map((trait) => (
                  <div key={trait.trait_type} className="share-trait">
                    <p>{trait.trait_type}</p>
                    <strong>{trait.value}</strong>
                  </div>
                ))}
              {Object.entries(share.attrs)
                .filter(([key]) => !["sealed", "revealed", "claimed", "deposit_lamports", "weight_1e18", "rarity", "dna", "instant"].includes(key))
                .slice(0, 8)
                .map(([key, value]) => (
                  <div key={key} className="rounded-xl border border-[var(--canopy-line)] bg-[var(--panel)] p-3">
                    <p className="font-mono2 text-xs uppercase text-[var(--canopy-muted)]">{key.replaceAll("_", " ")}</p>
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
            Browse gallery
          </Link>
          <Link href="/matter" className="btn-ghost px-6 py-3 text-sm text-center">
            How DNA works
          </Link>
        </div>

        <p className="mt-6 break-all font-mono2 text-sm leading-relaxed text-[var(--canopy-muted)]">
          {mint}
        </p>
      </div>
    </div>
  );
}
