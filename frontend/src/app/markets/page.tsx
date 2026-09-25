import Link from "next/link";
import CompanyLogo from "@/components/CompanyLogo";
import { compactUsd, getPreStocks, getPythParity, getTokenizedStocks, premium } from "@/lib/markets";

export const metadata = {
  title: "Tokenized Stocks",
  description: "Explore tokenized public stocks and PreStocks, then turn a market position into Digital Matter.",
};

export const revalidate = 60;

function shortAddress(address: string) {
  return `${address.slice(0, 5)}…${address.slice(-4)}`;
}

function publishedLabel(timestamp: number | null) {
  if (timestamp === null) return "Publish time unavailable";
  return `${new Date(timestamp * 1000).toISOString().slice(0, 16).replace("T", " ")} UTC`;
}

export default async function MarketsPage() {
  const [prestocks, xstocks, pyth] = await Promise.all([getPreStocks(), getTokenizedStocks(), getPythParity()]);
  const isPreStocksSnapshot = prestocks.some((stock) => stock.isFallback);
  const hasParity =
    pyth.underlying?.price != null &&
    pyth.token?.price != null &&
    !pyth.underlying.stale &&
    !pyth.token.stale;
  const parity = hasParity
    ? ((pyth.token!.price! - pyth.underlying!.price!) / pyth.underlying!.price!) * 100
    : null;

  return (
    <div className="shell pb-20 pt-16 sm:pt-24">
      <header className="market-page-head">
        <div>
          <p className="page-kicker">Public + private markets</p>
          <h1 className="page-title">The stock market, collected.</h1>
          <p className="page-lede">
            Compare tokenized public stocks and pre-IPO companies, then mint a collectible tied to your selection.
          </p>
        </div>
        <aside className="market-context">
          <strong className="block text-[var(--ink)]">This is a devnet experience.</strong>
          Minting uses mock mUSDC. Canopy records the selected market as collectible metadata and does not execute a stock purchase.
        </aside>
      </header>

      <section className="mt-16" aria-labelledby="stocks-title">
        <div className="market-lane-head">
          <div>
            <span className="market-lane-number">01</span>
            <div>
              <p className="page-kicker">Tokenized public stocks</p>
              <h2 id="stocks-title">Tokenized US equities on Solana.</h2>
              <p>Each xStock includes its mint address and matching Pyth market feeds.</p>
            </div>
          </div>
          <span className="status">xStocks · Pyth</span>
        </div>

        <div className="market-card-grid mt-7">
          {xstocks.map((stock) => {
            const query = new URLSearchParams({
              asset: stock.symbol,
              contract: stock.contractAddress,
              source: "xStocks",
            });
            if (stock.tokenPrice != null) query.set("price", stock.tokenPrice.toFixed(6));
            return (
              <article key={stock.contractAddress} className="market-card stock-card">
                <div className="market-card-top">
                  <CompanyLogo symbol={stock.underlyingSymbol} name={stock.name} className="market-card-logo" />
                  <span className="stock-market-state"><i />{stock.tradingOpen ? "Market open" : "24/5 token"}</span>
                </div>
                <div className="stock-source-row">
                  <span>{stock.symbol}</span>
                  <span>{stock.exchange} underlying</span>
                </div>
                <h3 className="market-card-name">{stock.name}</h3>
                <p className="market-card-symbol">{stock.underlyingSymbol} equity · {stock.symbol} token</p>
                <p className="market-card-price">{stock.tokenPrice == null ? "—" : `$${stock.tokenPrice.toFixed(2)}`}</p>
                <div className="stock-feed-pair">
                  <div><span>PYTH STOCK</span><strong>{stock.pythUnderlyingId.slice(0, 8)}··{stock.pythUnderlyingId.slice(-5)}</strong></div>
                  <div><span>PYTH TOKEN</span><strong>{stock.pythTokenId.slice(0, 8)}··{stock.pythTokenId.slice(-5)}</strong></div>
                </div>
                <div className="market-card-meta">
                  <span>Token-2022 on Solana</span>
                  <a href={`https://solscan.io/token/${stock.contractAddress}`} target="_blank" rel="noreferrer">Verify mint ↗</a>
                </div>
                <Link className="btn-primary market-card-action" href={`/instant?${query}`}>
                  Create {stock.symbol} matter
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section-block" aria-labelledby="prestocks-title">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-start gap-4">
              <span className="market-lane-number">02</span>
              <div>
                <p className="page-kicker">Pre-IPO markets</p>
                <h2 id="prestocks-title" className="text-2xl font-bold tracking-[-.035em]">Companies before the ticker.</h2>
              </div>
            </div>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {isPreStocksSnapshot ? "Latest official snapshot · Sep 25, 16:15 UTC" : "Live from the PreStocks API"}
            </p>
          </div>
          <span className="status">{isPreStocksSnapshot ? "Official snapshot" : "Live prices"}</span>
        </div>

        {prestocks.length ? (
          <div className="market-card-grid mt-7">
            {prestocks.map((stock) => {
              const spread = premium(stock.markPrice, stock.tokenPrice);
              const query = new URLSearchParams({
                asset: stock.symbol,
                contract: stock.contract_address,
                price: stock.tokenPrice.toFixed(6),
                source: "PreStocks",
              });
              return (
                <article key={stock.contract_address} className="market-card">
                  <div className="market-card-top">
                    <CompanyLogo symbol={stock.symbol} name={stock.name} className="market-card-logo" />
                    <a
                      className="market-card-contract relative z-10 hover:text-[var(--leaf)]"
                      href={`https://solscan.io/token/${stock.contract_address}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {shortAddress(stock.contract_address)} · verify ↗
                    </a>
                  </div>
                  <h3 className="market-card-name">{stock.name.replace(" PreStocks", "")}</h3>
                  <p className="market-card-symbol">{stock.symbol} · PreStocks</p>
                  <p className="market-card-price">${stock.tokenPrice.toFixed(2)}</p>
                  <div className="market-card-meta">
                    <span>Company mark ${stock.markPrice.toFixed(2)}</span>
                    <strong className={spread <= 0 ? "text-[var(--leaf)]" : "text-[var(--warning)]"}>
                      {spread > 0 ? "+" : ""}{spread.toFixed(1)}%
                    </strong>
                  </div>
                  <div className="mt-3 flex justify-between gap-3 text-xs text-[var(--quiet)]">
                    <span>Implied value</span>
                    <span className="font-semibold text-[var(--muted)]">{compactUsd(stock.impliedValuation)}</span>
                  </div>
                  <Link className="btn-primary market-card-action" href={`/instant?${query}`}>
                    Mint {stock.symbol} collectible
                  </Link>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="glass mt-7 p-6" role="status">
            PreStocks prices are temporarily unavailable. Refresh in a moment.
          </div>
        )}
      </section>

      <section className="section-block border-t border-[var(--line)]" aria-labelledby="pyth-title">
        <div className="grid gap-10 lg:grid-cols-[.65fr_1.35fr] lg:items-start">
          <div>
            <p className="page-kicker">Pyth price check</p>
            <h2 id="pyth-title" className="section-heading">Compare Apple stock with AAPLx.</h2>
            <p className="section-copy">
              Pyth gives Canopy a verified reference for the underlying stock and its 24/7 token.
              The difference appears only when both updates are fresh.
            </p>
          </div>

          <div className="price-compare">
            {[pyth.underlying, pyth.token].map((feed) => (
              <article key={feed?.symbol ?? "missing"} className="price-feed">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <CompanyLogo symbol="AAPL" name="Apple" className="price-feed-logo" />
                    <div>
                      <p className="text-sm font-bold">{feed?.symbol ?? "Feed unavailable"}</p>
                      <p className="mt-1 text-xs text-[var(--quiet)]">Pyth price feed</p>
                    </div>
                  </div>
                  <span className="status">
                    {feed?.price == null ? (feed?.isOpen ? "Waiting" : "Closed") : feed.stale ? "Stale" : "Fresh"}
                  </span>
                </div>
                <p className="price-feed-value">
                  {feed?.price == null ? "—" : `$${feed.price.toFixed(2)}`}
                </p>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                  {feed?.price == null
                    ? "No verified price update was found."
                    : `${feed.stale ? "Excluded from the comparison" : `Confidence ±$${feed.confidence?.toFixed(4)}`} · ${publishedLabel(feed.publishTime)}`}
                </p>
                {feed?.updateAccount && (
                  <a
                    className="mt-5 inline-block text-xs font-bold text-[var(--leaf)]"
                    href={`https://solscan.io/account/${feed.updateAccount}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Verify Pyth account ↗
                  </a>
                )}
              </article>
            ))}
            <div className="price-difference">
              Price difference: <strong>{parity == null ? "hidden until both prices are fresh" : `${parity > 0 ? "+" : ""}${parity.toFixed(3)}%`}</strong>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
