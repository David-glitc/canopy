import InstantMint from "@/components/InstantMint";
import CompanyLogo from "@/components/CompanyLogo";

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
    <div className="shell pb-24 pt-16 sm:pt-24">
      <header className="market-page-head">
        <div>
          <p className="page-kicker">One-minute devnet mint</p>
          <h1 className="page-title">
            {asset ? `Make ${asset} yours.` : "Mint your market pick."}
          </h1>
          <p className="page-lede">
            Pay with mock mUSDC. Your on-chain DNA assembles a one-of-one Digital Matter form at reveal.
          </p>
        </div>
        {asset && Number.isFinite(tokenPrice) ? (
          <div className="market-context">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CompanyLogo symbol={asset} name={asset} className="price-feed-logo" />
                <div>
                  <strong className="block text-lg text-[var(--ink)]">{asset}</strong>
                  <span>PreStocks · ${tokenPrice.toFixed(2)}</span>
                </div>
              </div>
              <a className="text-xs font-bold text-[var(--leaf)]" href={`https://solscan.io/token/${contract}`} target="_blank" rel="noreferrer">Verify token ↗</a>
            </div>
          </div>
        ) : (
          <div className="market-context">
            <strong className="block text-[var(--ink)]">Want a company-linked collectible?</strong>
            <a href="/markets" className="mt-2 inline-block font-bold text-[var(--leaf)]">Choose a PreStock first ↗</a>
          </div>
        )}
      </header>
      <div className="mt-12">
        <InstantMint asset={asset && contract ? { symbol: asset, contract, tokenPrice: Number.isFinite(tokenPrice) ? tokenPrice : undefined } : undefined} />
      </div>
    </div>
  );
}
