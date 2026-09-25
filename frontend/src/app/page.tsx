import Link from "next/link";
import CompanyLogo from "@/components/CompanyLogo";
import DigitalMatterLab from "@/components/DigitalMatterLab";
import { getPreStocks, getTokenizedStocks, premium } from "@/lib/markets";

export const revalidate = 60;

function mintHref(stock: { symbol: string; contract_address: string; tokenPrice: number }) {
  const query = new URLSearchParams({
    asset: stock.symbol,
    contract: stock.contract_address,
    price: stock.tokenPrice.toFixed(6),
    source: "PreStocks",
  });
  return `/instant?${query}`;
}

export default async function Home() {
  const [allPreStocks, tokenizedStocks] = await Promise.all([getPreStocks(), getTokenizedStocks()]);
  const prestocks = [...allPreStocks]
    .sort((a, b) => Math.abs(premium(b.markPrice, b.tokenPrice)) - Math.abs(premium(a.markPrice, a.tokenPrice)))
    .slice(0, 3);
  const featured = allPreStocks.find((stock) => stock.symbol.toUpperCase().includes("OPENAI")) ?? prestocks[0];
  const featuredSpread = featured ? premium(featured.markPrice, featured.tokenPrice) : 0;

  return (
    <div>
      <section className="hero">
        <div className="shell hero-grid">
          <div className="hero-copy-block">
            <p className="page-kicker">Stocks on Solana</p>
            <h1 className="hero-title">Collect the companies <span>you follow.</span></h1>
            <p className="hero-copy">Choose a public or private company. Mint a position. Its onchain record generates the artwork.</p>
            <div className="hero-actions">
              <Link href="/markets" className="btn-primary">Explore markets</Link>
              <Link href="/instant" className="btn-secondary">Create a collectible</Link>
            </div>
            <div className="hero-note"><span><i aria-hidden="true" />Devnet · Mock funds · $1.50 minimum</span></div>
          </div>

          <div className="collectible-stage" aria-label="Example Canopy collectible">
            <Link className="specimen-card" href={featured ? mintHref(featured) : "/instant"} aria-label={`Create the featured ${featured?.symbol ?? "PreStocks"} collectible`}>
              <div className="specimen-head">
                <span className="specimen-mark"><img src="/mark.svg" alt="" /></span>
                <span className="specimen-series">CANOPY · 01</span>
              </div>
              <div className="specimen-art">
                {featured && <CompanyLogo symbol={featured.symbol} name={featured.name} className="specimen-company-logo" />}
                <span className="specimen-symbol">{featured?.symbol.replace("PRE", "") ?? "OPENAI"}</span>
              </div>
              <div className="specimen-foot">
                <span className="specimen-name">Digital Matter</span>
                <span className="specimen-price">
                  <strong>${featured?.tokenPrice.toFixed(2) ?? "—"}</strong>
                  <span>{featuredSpread > 0 ? "+" : ""}{featuredSpread.toFixed(1)}%</span>
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="shell matter-home">
        <div className="matter-home-copy">
          <p className="page-kicker">Digital Matter</p>
          <h2>Your position becomes the artwork.</h2>
          <p>Amount, timing, and vault share determine every trait at reveal.</p>
          <Link href="/matter" className="btn-secondary">Open the trait lab</Link>
        </div>
        <DigitalMatterLab compact />
      </section>

      <section className="proof-strip" aria-label="Data and infrastructure partners">
        <div className="shell proof-strip-inner">
          <p>Built with</p>
          <div className="proof-logos"><span>PreStocks</span><span>xStocks</span><span>Pyth</span><span>Solana</span><span>Metaplex</span></div>
        </div>
      </section>

      <section className="shell section-block">
        <div className="home-market-head">
          <div><p className="page-kicker">Markets</p><h2 className="section-heading">Choose a company.</h2></div>
          <Link href="/markets" className="btn-secondary">View all markets</Link>
        </div>

        <div className="home-market-lane">
          <div className="home-market-lane-title"><h3>Public stocks</h3><span>xStocks · Pyth</span></div>
          <div className="market-card-grid">
            {tokenizedStocks.slice(0, 3).map((stock) => {
              const query = new URLSearchParams({ asset: stock.symbol, contract: stock.contractAddress, source: "xStocks" });
              if (stock.tokenPrice != null) query.set("price", stock.tokenPrice.toFixed(6));
              return (
                <article key={stock.contractAddress} className="market-card stock-card">
                  <div className="market-card-top">
                    <CompanyLogo symbol={stock.underlyingSymbol} name={stock.name} className="market-card-logo" />
                    <span className="stock-market-state"><i />{stock.tradingOpen ? "Open" : "Tokenized"}</span>
                  </div>
                  <h3 className="market-card-name">{stock.name}</h3>
                  <p className="market-card-symbol">{stock.symbol}</p>
                  <p className="market-card-price">{stock.tokenPrice == null ? "—" : `$${stock.tokenPrice.toFixed(2)}`}</p>
                  <div className="market-card-meta"><span>Pyth feeds</span><strong>{stock.underlyingSymbol} / {stock.symbol}</strong></div>
                  <Link href={`/instant?${query}`} className="btn-secondary market-card-action">Create {stock.symbol}</Link>
                </article>
              );
            })}
          </div>
        </div>

        <div className="home-market-lane">
          <div className="home-market-lane-title"><h3>Pre-IPO</h3><span>PreStocks</span></div>
          {prestocks.length ? (
            <div className="market-card-grid">
              {prestocks.map((stock) => {
                const spread = premium(stock.markPrice, stock.tokenPrice);
                return (
                  <article key={stock.contract_address} className="market-card">
                    <div className="market-card-top">
                      <CompanyLogo symbol={stock.symbol} name={stock.name} className="market-card-logo" />
                      <span className="market-card-contract">{stock.contract_address.slice(0, 4)}…{stock.contract_address.slice(-4)}</span>
                    </div>
                    <h3 className="market-card-name">{stock.name.replace(" PreStocks", "")}</h3>
                    <p className="market-card-symbol">{stock.symbol}</p>
                    <p className="market-card-price">${stock.tokenPrice.toFixed(2)}</p>
                    <div className="market-card-meta"><span>Mark ${stock.markPrice.toFixed(2)}</span><strong className={spread <= 0 ? "text-[var(--leaf)]" : "text-[var(--warning)]"}>{spread > 0 ? "+" : ""}{spread.toFixed(1)}%</strong></div>
                    <Link href={mintHref(stock)} className="btn-secondary market-card-action">Create {stock.symbol}</Link>
                  </article>
                );
              })}
            </div>
          ) : <div className="glass p-6">Prices unavailable.</div>}
        </div>
      </section>
    </div>
  );
}
