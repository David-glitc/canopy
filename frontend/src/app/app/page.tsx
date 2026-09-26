import Link from "next/link";
import CompanyLogo from "@/components/CompanyLogo";
import { getPreStocks, getTokenizedStocks } from "@/lib/markets";

export const metadata = {
  title: "App",
  description: "Canopy markets, token-set vaults, and collectible positions.",
};

export const revalidate = 30;

type MarketRow = {
  name: string;
  symbol: string;
  logo: string;
  price: number | null;
  source: "xStocks" | "PreStocks";
  contract: string;
};

function instantHref(market: MarketRow) {
  const query = new URLSearchParams({
    asset: market.symbol,
    contract: market.contract,
    source: market.source,
  });
  if (market.price != null) query.set("price", market.price.toFixed(6));
  return `/instant?${query}`;
}

export default async function AppHome() {
  const [prestocks, xstocks] = await Promise.all([getPreStocks(), getTokenizedStocks()]);
  const marketRows: MarketRow[] = [
    ...xstocks.slice(0, 3).map((stock) => ({ name: stock.name, symbol: stock.symbol, logo: stock.underlyingSymbol, price: stock.tokenPrice, source: "xStocks" as const, contract: stock.contractAddress })),
    ...prestocks.slice(0, 3).map((stock) => ({ name: stock.name.replace(" PreStocks", ""), symbol: stock.symbol, logo: stock.symbol, price: stock.tokenPrice, source: "PreStocks" as const, contract: stock.contract_address })),
  ];

  return (
    <div className="shell app-dashboard">
      <section className="app-welcome">
        <div className="app-welcome-copy"><p className="page-kicker">CANOPY</p><h1>Your stock collection.</h1><p>Mint one stock or fund a basket.</p></div>
        <div className="app-welcome-actions"><Link href="/markets" className="btn-primary">Browse stocks <span>↗</span></Link><Link href="/sectors" className="btn-secondary">Find a vault</Link></div>
      </section>

      <section className="app-market-panel">
        <div className="app-panel-head"><div><p className="vault-section-label">LIVE CATALOG</p><h2>Token markets</h2></div><Link href="/markets">See all <span>↗</span></Link></div>
        <div className="app-market-list">
          {marketRows.map((market) => <Link href={instantHref(market)} key={`${market.source}-${market.symbol}`}>
            <CompanyLogo symbol={market.logo} name={market.name} />
            <span><strong>{market.name}</strong><small>{market.symbol} · {market.source}</small></span>
            <b>{market.price == null ? "—" : `$${market.price.toFixed(2)}`}</b>
            <i>↗</i>
          </Link>)}
        </div>
      </section>

    </div>
  );
}
