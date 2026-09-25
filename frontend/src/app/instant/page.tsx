import InstantMint from "@/components/InstantMint";

export const metadata = {
  title: "Mint",
  description: "Mint a PreStocks-linked collectible with mock funds on Solana devnet.",
};

export default async function InstantPage({
  searchParams,
}: {
  searchParams: Promise<{ asset?: string; contract?: string; price?: string }>;
}) {
  const selected = await searchParams;
  const asset = selected.asset?.slice(0, 24).toUpperCase();
  const contract = selected.contract?.slice(0, 64);
  const tokenPrice = Number(selected.price);
  return (
    <div className="mx-auto max-w-6xl px-6 pb-24 pt-16 sm:pt-24">
      <p className="page-kicker">One-minute devnet demo</p>
      <h1 className="font-display mt-4 text-balance text-4xl font-extrabold sm:text-6xl">
        {asset ? `Mint an ${asset} collectible.` : "Mint a devnet collectible."}
      </h1>
      <p className="mt-4 max-w-2xl text-pretty leading-relaxed text-[var(--canopy-muted)]">
        Pay with mock mUSDC. Your wallet receives a Metaplex Core asset with the selected PreStocks
        symbol and Solana token address in its metadata.
      </p>
      {asset && Number.isFinite(tokenPrice) && (
        <div className="mt-6 inline-flex items-center gap-4 border border-[var(--line)] bg-[var(--panel)] px-4 py-3">
          <span className="font-mono text-sm text-[var(--leaf)]">{asset}</span>
          <span className="font-mono text-sm tabular">PreStocks ${tokenPrice.toFixed(2)}</span>
          <a className="font-mono text-xs text-[var(--quiet)] hover:text-[var(--leaf)]" href={`https://solscan.io/token/${contract}`}>Verify PreStocks token ↗</a>
        </div>
      )}
      <div className="mt-10">
        <InstantMint asset={asset && contract ? { symbol: asset, contract, tokenPrice: Number.isFinite(tokenPrice) ? tokenPrice : undefined } : undefined} />
      </div>
    </div>
  );
}
