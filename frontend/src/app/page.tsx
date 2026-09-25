import Link from "next/link";
import ProgramStatus from "@/components/ProgramStatus";
import { getPreStocks, premium } from "@/lib/markets";

export const revalidate = 60;

export default async function Home() {
  const allPreStocks = await getPreStocks();
  const isPreStocksSnapshot = allPreStocks.some((stock) => stock.isFallback);
  const prestocks = allPreStocks
    .sort((a, b) => Math.abs(premium(b.markPrice, b.tokenPrice)) - Math.abs(premium(a.markPrice, a.tokenPrice)))
    .slice(0, 3);

  return (
    <div>
      <section className="shell grid min-h-[min(44rem,calc(100vh-4.5rem))] items-center gap-12 border-x border-[var(--line)] px-5 py-16 sm:px-10 lg:grid-cols-[1.08fr_.92fr] lg:px-14">
        <div>
          <p className="page-kicker">PreStocks collectibles · Solana devnet</p>
          <h1 className="page-title text-balance">
            <span className="block">Pick a company.</span>
            <span className="block">Mint a collectible.</span>
          </h1>
          <p className="page-lede text-pretty">
            Compare tokenized pre-IPO companies from PreStocks, choose one, and mint a Metaplex
            Core collectible with mock funds.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/markets" className="btn-primary">Browse PreStocks</Link>
            <Link href="/instant" className="btn-secondary">Try the mint</Link>
          </div>
          <dl className="mt-12 grid max-w-xl grid-cols-3 border-y border-[var(--line)] py-4">
            <div><dt className="font-mono text-xs text-[var(--quiet)]">MINIMUM</dt><dd className="mt-1 font-mono text-lg font-semibold tabular">$1.50</dd></div>
            <div><dt className="font-mono text-xs text-[var(--quiet)]">PAYMENT</dt><dd className="mt-1 font-mono text-lg font-semibold">mock USDC</dd></div>
            <div><dt className="font-mono text-xs text-[var(--quiet)]">NETWORK</dt><dd className="mt-1 font-mono text-lg font-semibold">devnet</dd></div>
          </dl>
        </div>

        <div className="relative mx-auto w-full max-w-[31rem]" aria-label="How Canopy works">
          <div className="absolute -inset-3 border border-[var(--line)]" aria-hidden="true" />
          <div className="relative bg-[var(--panel)] p-4 sm:p-6">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
              <div>
                <p className="font-mono text-xs text-[var(--quiet)]">ONE-MINUTE DEMO</p>
                <p className="mt-1 font-semibold">From market list to wallet</p>
              </div>
              <span className="status">Live</span>
            </div>
            <ol className="divide-y divide-[var(--line)]">
              {[
                ["01", "Compare", "See PreStocks token and mark prices."],
                ["02", "Mint", "Pay with mock funds on Solana devnet."],
                ["03", "Verify", "Open the asset metadata and program."],
              ].map(([step, title, copy]) => (
                <li key={step} className="grid grid-cols-[2rem_1fr] gap-4 py-5">
                  <span className="font-mono text-xs text-[var(--leaf)]">{step}</span>
                  <div>
                    <p className="font-semibold">{title}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{copy}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--line)] bg-[var(--ink-2)]">
        <div className="shell flex flex-wrap items-center justify-between gap-4 py-4 text-sm">
          <span className="font-mono text-[var(--quiet)]">Built with</span>
          <div className="flex flex-wrap gap-x-7 gap-y-2 font-semibold">
            <span>PreStocks</span><span>Pyth Network</span><span>Solana</span><span>Metaplex Core</span>
          </div>
        </div>
      </section>

      <section className="shell py-20">
        <div className="grid gap-10 lg:grid-cols-[.65fr_1.35fr]">
          <div>
            <p className="page-kicker">{isPreStocksSnapshot ? "Official PreStocks snapshot" : "Live PreStocks data"}</p>
            <h2 className="mt-4 text-balance text-4xl font-bold">Choose from official PreStocks.</h2>
            <p className="mt-4 text-pretty text-base leading-7 text-[var(--muted)]">
              Compare token price with the company mark, then send your pick straight to the mint.
            </p>
            <Link href="/markets" className="btn-secondary mt-6">See all PreStocks</Link>
          </div>
          <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {prestocks.length ? prestocks.map((stock) => {
              const spread = premium(stock.markPrice, stock.tokenPrice);
              return (
                <div key={stock.contract_address} className="grid grid-cols-[1fr_auto] items-center gap-5 py-5">
                  <div className="flex items-center gap-4">
                    <span className="market-logo" aria-hidden="true">{stock.symbol.slice(0, 2)}</span>
                    <div><p className="font-semibold">{stock.name.replace(' PreStocks', '')}</p><p className="font-mono text-xs text-[var(--quiet)]">{stock.symbol}</p></div>
                  </div>
                  <div className="text-right"><p className="font-mono font-semibold tabular">${stock.tokenPrice.toFixed(2)}</p><p className={`font-mono text-xs tabular ${spread <= 0 ? 'text-[var(--leaf)]' : 'text-[var(--warning)]'}`}>{spread > 0 ? '+' : ''}{spread.toFixed(1)}% vs mark</p></div>
                </div>
              );
            }) : <p className="py-8 text-[var(--muted)]">Live PreStocks prices will appear here.</p>}
          </div>
        </div>
      </section>

      <section className="shell border-t border-[var(--line)] py-20">
        <div className="grid gap-px border border-[var(--line)] bg-[var(--line)] md:grid-cols-3">
          {[
            ["Pick", "Browse official PreStocks data and choose a company."],
            ["Mint", "Use mock mUSDC to create a collectible on Solana devnet."],
            ["Verify", "Inspect the asset metadata and both deployed programs."],
          ].map(([title, copy]) => (
            <article key={title} className="bg-[var(--panel)] p-7">
              <h2 className="text-xl font-bold">{title}</h2>
              <p className="mt-3 text-pretty text-sm leading-6 text-[var(--muted)]">{copy}</p>
            </article>
          ))}
        </div>
        <div className="mt-10 flex flex-col justify-between gap-5 border border-[var(--line)] bg-[var(--panel)] p-7 sm:flex-row sm:items-center">
          <div>
            <p className="font-semibold">Want the group demo?</p>
            <p className="mt-1 text-pretty text-sm text-[var(--muted)]">
              Shared vaults pool mock deposits, mint one collectible per deposit, and refund failed goals.
            </p>
          </div>
          <Link href="/sectors" className="btn-secondary whitespace-nowrap">Open group vaults</Link>
        </div>
      </section>

      <section className="shell"><ProgramStatus /></section>
    </div>
  );
}
