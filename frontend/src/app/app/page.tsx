import Link from "next/link";
import CompanyLogo from "@/components/CompanyLogo";
import { getPreStocks, getTokenizedStocks } from "@/lib/markets";

export const metadata = {
  title: "App",
  description: "Canopy markets, token-set vaults, and collectible positions.",
};

export const revalidate = 30;

export default async function AppHome() {
  const [prestocks, xstocks] = await Promise.all([getPreStocks(), getTokenizedStocks()]);
  const marketRows = [
    ...xstocks.slice(0, 3).map((stock) => ({ name: stock.name, symbol: stock.symbol, logo: stock.underlyingSymbol, price: stock.tokenPrice, source: "xStocks" })),
    ...prestocks.slice(0, 3).map((stock) => ({ name: stock.name.replace(" PreStocks", ""), symbol: stock.symbol, logo: stock.symbol, price: stock.tokenPrice, source: "PreStocks" })),
  ];

  return (
    <div className="shell app-dashboard">
      <section className="app-welcome">
        <div><p className="page-kicker">Canopy app</p><h1>Your stock-collectible desk.</h1><p>Choose a market, fund a token set, or open your collection.</p></div>
        <div className="app-welcome-actions"><Link href="/markets" className="btn-primary">Explore markets</Link><Link href="/profile" className="btn-secondary">Open portfolio</Link></div>
      </section>

      <section className="app-actions" aria-label="Primary actions">
        <Link href="/markets"><span>01</span><div><small>MARKETS</small><h2>Choose a stock</h2><p>Public xStocks and private PreStocks.</p></div><b>↗</b></Link>
        <Link href="/sectors"><span>02</span><div><small>GROUP VAULTS</small><h2>Build a token set</h2><p>Fund, mint sealed, and reveal together.</p></div><b>↗</b></Link>
        <Link href="/profile"><span>03</span><div><small>COLLECTION</small><h2>Manage positions</h2><p>NAV, claim weights, artifacts, and XP.</p></div><b>↗</b></Link>
      </section>

      <section className="app-market-panel">
        <div className="app-panel-head"><div><p className="vault-section-label">MARKET PULSE</p><h2>Available tokenized stocks</h2></div><Link href="/markets">View all markets ↗</Link></div>
        <div className="app-market-list">
          {marketRows.map((market) => <Link href="/markets" key={`${market.source}-${market.symbol}`}>
            <CompanyLogo symbol={market.logo} name={market.name} />
            <span><strong>{market.name}</strong><small>{market.symbol} · {market.source}</small></span>
            <b>{market.price == null ? "—" : `$${market.price.toFixed(2)}`}</b>
            <i>↗</i>
          </Link>)}
        </div>
      </section>

      <section className="app-bottom-grid">
        <Link href="/instant" className="app-bottom-card"><small>QUICK CREATE</small><h2>One stock. One Share.</h2><p>Use a selected market to create instant Digital Matter.</p><strong>Start an instant mint ↗</strong></Link>
        <Link href="/leaderboard" className="app-bottom-card"><small>SEASON XP</small><h2>Climb through activity.</h2><p>Funding, reveals, and collection activity build your rank.</p><strong>Open rankings ↗</strong></Link>
      </section>
    </div>
  );
}
