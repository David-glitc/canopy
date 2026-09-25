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
            <p className="page-kicker">Tokenized stocks → Digital Matter</p>
            <h1 className="hero-title">Choose the company. <span>Shape the collectible.</span></h1>
            <p className="hero-copy">Start with an xStock or PreStock. Your position writes the DNA for a one-of-one onchain form.</p>
            <div className="hero-actions">
              <Link href="/markets" className="btn-primary">Choose a market</Link>
              <Link href="/sectors" className="btn-secondary">Join a vault</Link>
            </div>
          </div>

          <div className="collectible-stage" aria-label="Featured Canopy collectible">
            <Link className="specimen-card" href={featured ? mintHref(featured) : "/markets"} aria-label={`Create the featured ${featured?.symbol ?? "PreStocks"} collectible`}>
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

      <section className="shell home-path" aria-labelledby="path-title">
        <div className="home-market-head">
          <div><p className="page-kicker">How Canopy works</p><h2 id="path-title" className="section-heading">Market in. Matter out.</h2></div>
          <Link href="/matter" className="btn-secondary">See the trait engine</Link>
        </div>
        <div className="journey">
          <Link href="/markets" className="journey-step"><span className="journey-number">01</span><h3>Pick a company.</h3><p>Compare public stocks and pre-IPO markets in one place.</p></Link>
          <Link href="/instant" className="journey-step"><span className="journey-number">02</span><h3>Build a position.</h3><p>Create solo, or enter a group vault with other collectors.</p></Link>
          <Link href="/matter" className="journey-step"><span className="journey-number">03</span><h3>Reveal the form.</h3><p>Position size, timing, and vault share assemble every trait.</p></Link>
        </div>
      </section>

      <section className="shell section-block">
        <div className="home-market-head">
          <div><p className="page-kicker">Live markets</p><h2 className="section-heading">Start with a company.</h2></div>
          <Link href="/markets" className="btn-secondary">Explore every market</Link>
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
                  <div className="market-card-meta"><span>Pyth market data</span><strong>{stock.underlyingSymbol} / {stock.symbol}</strong></div>
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
                    <div className="market-card-meta"><span>Company mark ${stock.markPrice.toFixed(2)}</span><strong className={spread <= 0 ? "text-[var(--leaf)]" : "text-[var(--warning)]"}>{spread > 0 ? "+" : ""}{spread.toFixed(1)}%</strong></div>
                    <Link href={mintHref(stock)} className="btn-secondary market-card-action">Create {stock.symbol}</Link>
                  </article>
                );
              })}
            </div>
          ) : <div className="glass p-6">Markets are refreshing.</div>}
        </div>
      </section>

      <section className="shell matter-home">
        <div className="matter-home-copy">
          <p className="page-kicker">Digital Matter</p>
          <h2>Built by your position.</h2>
          <p>No premade editions. Every collectible is assembled from its own market and vault history.</p>
          <Link href="/matter" className="btn-secondary">Explore the DNA</Link>
        </div>
        <DigitalMatterLab compact />
      </section>

      <section className="proof-strip" aria-label="Data and infrastructure partners">
        <div className="shell proof-strip-inner">
          <p>Market data & rails</p>
          <div className="proof-logos"><span>PreStocks</span><span>xStocks</span><span>Pyth</span><span>Solana</span><span>Metaplex</span></div>
        </div>
      </section>
    </div>
  );
}
