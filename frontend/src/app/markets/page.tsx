import Link from "next/link";
import { compactUsd, getPreStocks, getPythParity, premium } from "@/lib/markets";

export const metadata = {
  title: "Markets",
  description: "Discover PreStocks and inspect Pyth equity-to-token parity before minting a Canopy claim.",
};

export const revalidate = 60;

function shortAddress(address: string) {
  return `${address.slice(0, 5)}…${address.slice(-4)}`;
}

function publishedLabel(timestamp: number | null) {
  if (timestamp === null) return "publish time unavailable";
  return `${new Date(timestamp * 1000).toISOString().slice(0, 16).replace("T", " ")} UTC`;
}

export default async function MarketsPage() {
  const [prestocks, pyth] = await Promise.all([getPreStocks(), getPythParity()]);
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
    <div className="shell pb-16 pt-16 sm:pt-24">
      <p className="page-kicker">Live market sources</p>
      <h1 className="page-title">Pick the company. Let the claim reveal.</h1>
      <p className="page-lede">
        Canopy turns a market thesis into a verifiable Solana collectible. PreStocks supplies the
        private-company universe; Pyth supplies the public-market reference layer.
      </p>

      <section className="mt-14" aria-labelledby="prestocks-title">
        <div className="flex flex-col gap-4 border-b border-[var(--line)] pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-sm text-[var(--leaf)]">PRESTOCKS / SOLANA</p>
            <h2 id="prestocks-title" className="mt-2 text-3xl font-bold tracking-[-0.04em]">Pre-IPO claim desk</h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-[var(--muted)]">
            {isPreStocksSnapshot ? "Last-known official PreStocks snapshot · Sep 25, 16:15 UTC. " : "Live token and mark prices from the official PreStocks API. "}
            Choose a company to carry its Solana mint into your devnet Canopy Share metadata.
          </p>
        </div>

        {prestocks.length ? (
          <div>
            <p className="mt-5 font-mono text-xs text-[var(--quiet)] sm:hidden">
              {"Swipe for valuation and mint action →"}
            </p>
            <div className="market-scroll mt-2 sm:mt-6" role="region" aria-label="Scrollable PreStocks market data" tabIndex={0}>
            <table className="market-table" aria-label="Live PreStocks products">
              <thead>
                <tr>
                  <th scope="col">Company</th>
                  <th scope="col">Token</th>
                  <th scope="col">Mark</th>
                  <th scope="col">Premium</th>
                  <th scope="col">Implied value</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {prestocks.map((stock) => {
                  const spread = premium(stock.markPrice, stock.tokenPrice);
                  const query = new URLSearchParams({
                    asset: stock.symbol,
                    contract: stock.contract_address,
                    price: stock.tokenPrice.toFixed(6),
                  });
                  return (
                    <tr key={stock.contract_address}>
                      <td>
                        <div className="flex items-center gap-3">
                          <span className="market-logo" aria-hidden="true">{stock.symbol.slice(0, 2)}</span>
                          <div>
                            <strong className="block text-sm">{stock.name.replace(" PreStocks", "")}</strong>
                            <a className="font-mono text-xs text-[var(--quiet)] hover:text-[var(--leaf)]" href={`https://solscan.io/token/${stock.contract_address}`}>
                              {shortAddress(stock.contract_address)}
                            </a>
                          </div>
                        </div>
                      </td>
                      <td className="font-mono text-sm tabular">${stock.tokenPrice.toFixed(2)}</td>
                      <td className="font-mono text-sm tabular text-[var(--muted)]">${stock.markPrice.toFixed(2)}</td>
                      <td className={`font-mono text-sm tabular ${spread <= 0 ? "text-[var(--leaf)]" : "text-[var(--warning)]"}`}>
                        {spread > 0 ? "+" : ""}{spread.toFixed(1)}%
                      </td>
                      <td className="font-mono text-sm tabular text-[var(--muted)]">{compactUsd(stock.impliedValuation)}</td>
                      <td><Link className="btn-primary btn-compact whitespace-nowrap" href={`/instant?${query}`}>Mint claim</Link></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </div>
        ) : (
          <div className="mt-6 border border-[var(--line)] bg-[var(--panel)] p-6" role="status">
            PreStocks prices are temporarily unavailable. Refresh in a moment.
          </div>
        )}
        <p className="mt-4 text-xs leading-5 text-[var(--quiet)]">
          PreStocks provide economic exposure only and carry eligibility, liquidity, and total-loss risk.
          {isPreStocksSnapshot ? " The live source is rate-limited; snapshot values are clearly marked above." : ""}
          {" The Canopy demo settles with mock mUSDC on devnet."}
        </p>
      </section>

      <section className="mt-20" aria-labelledby="pyth-title">
        <div className="grid gap-8 border-t border-[var(--line)] pt-8 lg:grid-cols-[.7fr_1.3fr]">
          <div>
            <p className="font-mono text-sm text-[var(--purple)]">PYTH / PARITY GUARD</p>
            <h2 id="pyth-title" className="mt-2 text-3xl font-bold tracking-[-0.04em]">Underlying versus 24/7 token.</h2>
            <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
              Canopy resolves the canonical AAPL equity feed beside AAPLx, then reads fully verified
              Pyth Receiver updates from Solana. Stale data automatically blocks the parity signal.
            </p>
          </div>
          <div className="grid gap-px overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--line)] sm:grid-cols-2">
            {[pyth.underlying, pyth.token].map((feed) => (
              <div key={feed?.symbol ?? "missing"} className="bg-[var(--panel)] p-5">
                <div className="flex items-start justify-between gap-3">
                  <span className="font-mono text-xs text-[var(--quiet)]">{feed?.symbol ?? "Feed unavailable"}</span>
                  <span className="status">
                    {feed?.price == null ? (feed?.isOpen ? "Feed active" : "Market closed") : feed.stale ? "Stale update" : "Live update"}
                  </span>
                </div>
                <p className="mt-8 font-mono text-3xl font-semibold tabular">
                  {feed?.price == null ? "Feed ready" : `$${feed.price.toFixed(2)}`}
                </p>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  {feed?.price == null
                    ? "Price metadata is available; no verified update was found."
                    : `${feed.stale ? "Parity blocked" : `Confidence ±$${feed.confidence?.toFixed(4)}`} · ${publishedLabel(feed.publishTime)}`}
                </p>
                {feed?.updateAccount && (
                  <a
                    className="mt-4 inline-block font-mono text-xs text-[var(--leaf)]"
                    href={`https://solscan.io/account/${feed.updateAccount}`}
                  >
                    Pyth Receiver account ↗
                  </a>
                )}
                {feed && <p className="mt-5 break-all font-mono text-xs text-[var(--quiet)]">{feed.id}</p>}
              </div>
            ))}
            <div className="bg-[var(--ink-2)] p-4 sm:col-span-2">
              <p className="font-mono text-sm text-[var(--muted)]">
                Parity spread: <strong className="text-[var(--paper)]">{parity == null ? "blocked until both Pyth updates are fresh" : `${parity > 0 ? "+" : ""}${parity.toFixed(3)}%`}</strong>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
