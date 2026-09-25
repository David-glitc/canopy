import InstantMint from "@/components/InstantMint";
import CompanyLogo from "@/components/CompanyLogo";

export const metadata = {
  title: "Create",
  description: "Turn a tokenized public or private stock into Digital Matter.",
};

export default async function InstantPage({
  searchParams,
}: {
  searchParams: Promise<{ asset?: string; contract?: string; price?: string; source?: string }>;
}) {
  const selected = await searchParams;
  const asset = selected.asset?.slice(0, 24).toUpperCase();
  const contract = selected.contract?.slice(0, 64);
  const tokenPrice = Number(selected.price);
  const source = selected.source === "xStocks" ? "xStocks" : "PreStocks";
  return (
    <div className="shell pb-24 pt-16 sm:pt-24">
      <header className="market-page-head">
        <div>
          <p className="page-kicker">Create from a market</p>
          <h1 className="page-title">
            {asset ? `${asset} becomes Digital Matter.` : "Choose a market. Shape the matter."}
          </h1>
          <p className="page-lede">
            Set the position size. Its onchain record becomes the DNA for a unique form.
          </p>
        </div>
        {asset && contract ? (
          <div className="market-context">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CompanyLogo symbol={asset} name={asset} className="price-feed-logo" />
                <div>
                  <strong className="block text-lg text-[var(--ink)]">{asset}</strong>
                  <span>{source}{Number.isFinite(tokenPrice) ? ` · $${tokenPrice.toFixed(2)}` : " · tokenized equity"}</span>
                </div>
              </div>
              <a className="text-xs font-bold text-[var(--leaf)]" href={`https://solscan.io/token/${contract}`} target="_blank" rel="noreferrer">Verify token ↗</a>
            </div>
          </div>
        ) : (
          <div className="market-context">
            <strong className="block text-[var(--ink)]">Start with the company.</strong>
            <a href="/markets" className="mt-2 inline-block font-bold text-[var(--leaf)]">Choose a market ↗</a>
          </div>
        )}
      </header>
      <div className="mt-12">
        <InstantMint asset={asset && contract ? { symbol: asset, contract, source, tokenPrice: Number.isFinite(tokenPrice) ? tokenPrice : undefined } : undefined} />
      </div>
    </div>
  );
}
