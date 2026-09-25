import Link from "next/link";
import ProgramStatus from "@/components/ProgramStatus";
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
  const isPreStocksSnapshot = allPreStocks.some((stock) => stock.isFallback);
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
            <p className="page-kicker">Tokenized stocks become Digital Matter</p>
            <h1 className="hero-title">
              Collect the companies <span>you&apos;re watching.</span>
            </h1>
            <p className="hero-copy">
              Explore tokenized public stocks and pre-IPO companies, then turn your market position
              into a verifiable being assembled from on-chain DNA.
            </p>
            <div className="hero-actions">
              <Link href="/markets" className="btn-primary">Choose a company <span aria-hidden="true">↗</span></Link>
              <Link href="/instant" className="btn-secondary">Open the mint</Link>
            </div>
            <div className="hero-note" aria-label="Demo details">
              <span><i aria-hidden="true" />No real funds</span>
              <span><i aria-hidden="true" />$1.50 minimum</span>
              <span><i aria-hidden="true" />Takes about one minute</span>
            </div>
          </div>

          <div className="collectible-stage" aria-label="Example Canopy collectible">
            <span className="float-chip float-chip-a">Metaplex Core asset</span>
            <Link className="specimen-card" href={featured ? mintHref(featured) : "/instant"} aria-label={`Mint the featured ${featured?.symbol ?? "PreStocks"} collectible`}>
              <div className="specimen-head">
                <span className="specimen-mark">C</span>
                <span className="specimen-series">CANOPY · SERIES 01</span>
              </div>
              <div className="specimen-art">
                {featured && <CompanyLogo symbol={featured.symbol} name={featured.name} className="specimen-company-logo" />}
                <span className="specimen-symbol">{featured?.symbol.replace("PRE", "") ?? "OPENAI"}</span>
              </div>
              <div className="specimen-foot">
                <span className="specimen-name">Market position<br />on Solana devnet</span>
                <span className="specimen-price">
                  <strong>${featured?.tokenPrice.toFixed(2) ?? "—"}</strong>
                  <span>{featuredSpread > 0 ? "+" : ""}{featuredSpread.toFixed(1)}% vs mark</span>
                </span>
              </div>
            </Link>
            <span className="float-chip float-chip-b">Tap to mint this pick</span>
          </div>
        </div>
      </section>

      <section className="shell matter-home">
        <div className="matter-home-copy">
          <p className="page-kicker">Digital Matter Theory</p>
          <h2>The image is not waiting in a folder.</h2>
          <p>
            Every collectible is assembled from on-chain DNA when it is revealed. Funding state
            becomes form, material, core, aura, crown, and pixel geometry.
          </p>
          <Link href="/matter" className="btn-secondary">Enter the DNA lab <span>↗</span></Link>
        </div>
        <DigitalMatterLab compact />
      </section>

      <section className="proof-strip" aria-label="Technology partners">
        <div className="shell proof-strip-inner">
          <p>Live product data and verifiable onchain assets</p>
          <div className="proof-logos">
            <span>PreStocks</span><span>Pyth</span><span>Solana</span><span>Metaplex</span>
          </div>
        </div>
      </section>

      <section className="shell section-block">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="page-kicker">Public stocks onchain</p>
            <h2 className="section-heading">Tesla, Apple, Nvidia. In your wallet.</h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-[var(--muted)] sm:text-right">
            Official Solana xStocks assets paired with Pyth equity and token feeds.
          </p>
        </div>
        <div className="market-card-grid mt-10">
          {tokenizedStocks.slice(0, 3).map((stock) => {
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
                  <span className="stock-market-state"><i />{stock.tradingOpen ? "Market open" : "Tokenized"}</span>
                </div>
                <h3 className="market-card-name">{stock.name}</h3>
                <p className="market-card-symbol">{stock.symbol} · xStocks on Solana</p>
                <p className="market-card-price">{stock.tokenPrice == null ? "—" : `$${stock.tokenPrice.toFixed(2)}`}</p>
                <div className="market-card-meta"><span>Pyth paired feeds</span><strong>{stock.underlyingSymbol} / {stock.symbol}</strong></div>
                <Link href={`/instant?${query}`} className="btn-secondary market-card-action">Create {stock.symbol} matter</Link>
              </article>
            );
          })}
        </div>
        <Link href="/markets" className="mt-6 inline-flex text-sm font-bold text-[var(--leaf)]">See every public and private market ↗</Link>
      </section>

      <section className="shell section-block">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="page-kicker">Pick from the market</p>
            <h2 className="section-heading">Private companies, before the ticker.</h2>
          </div>
          <div className="max-w-sm sm:text-right">
            <p className="text-sm leading-6 text-[var(--muted)]">
              {isPreStocksSnapshot ? "Showing the latest official PreStocks snapshot." : "Prices update from the official PreStocks API."}
            </p>
            <Link href="/markets" className="mt-3 inline-block text-sm font-bold text-[var(--leaf)]">Compare every price ↗</Link>
          </div>
        </div>

        <div className="market-card-grid mt-10">
          {prestocks.length ? prestocks.map((stock) => {
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
                <div className="market-card-meta">
                  <span>Mark ${stock.markPrice.toFixed(2)}</span>
                  <strong className={spread <= 0 ? "text-[var(--leaf)]" : "text-[var(--warning)]"}>
                    {spread > 0 ? "+" : ""}{spread.toFixed(1)}%
                  </strong>
                </div>
                <Link href={mintHref(stock)} className="btn-secondary market-card-action">Mint {stock.symbol}</Link>
              </article>
            );
          }) : (
            <div className="glass col-span-full p-6">PreStocks prices are temporarily unavailable.</div>
          )}
        </div>
      </section>

      <section className="border-y border-[var(--line)] bg-[var(--panel)]/45">
        <div className="shell section-block">
          <div className="grid gap-8 lg:grid-cols-[.7fr_1.3fr] lg:gap-20">
            <div>
              <p className="page-kicker">The whole demo</p>
              <h2 className="section-heading">From a market pick to your wallet.</h2>
              <p className="section-copy">The flow is short enough to test during judging and transparent enough to verify afterward.</p>
            </div>
            <div className="journey">
              {[
                ["1", "Choose", "Compare the token price with the company mark."],
                ["2", "Mint", "Use mock mUSDC to create your collectible."],
                ["3", "Verify", "Inspect the asset metadata and Solana program."],
              ].map(([step, title, copy]) => (
                <article key={step} className="journey-step">
                  <span className="journey-number">{step}</span>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="shell section-block">
        <div className="grid gap-8 lg:grid-cols-[.72fr_1.28fr] lg:items-start">
          <div>
            <p className="page-kicker">Built on devnet</p>
            <h2 className="section-heading">Check the programs yourself.</h2>
            <p className="section-copy">Both Canopy programs are deployed and linked directly to Solana Explorer.</p>
            <Link href="/sectors" className="btn-secondary mt-6">Try group vaults</Link>
          </div>
          <ProgramStatus />
        </div>
      </section>
    </div>
  );
}
