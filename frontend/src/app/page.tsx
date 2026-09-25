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
      <section className="shell grid min-h-[min(48rem,calc(100vh-4.5rem))] items-center gap-12 border-x border-[var(--line)] px-5 py-16 sm:px-10 lg:grid-cols-[1.08fr_.92fr] lg:px-14">
        <div>
          <p className="page-kicker">Solana devnet · programs live</p>
          <h1 className="page-title">Own the thesis. Reveal the weight.</h1>
          <p className="page-lede">
            Choose a tokenized company, fund a shared vault, and mint a sealed Core NFT. When the
            Sector closes, Solana entropy reveals your pro-rata claim and market-governance weight.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/markets" className="btn-primary">Choose a company</Link>
            <Link href="/sectors" className="btn-secondary">Inspect live Sectors</Link>
          </div>
          <dl className="mt-12 grid max-w-xl grid-cols-3 border-y border-[var(--line)] py-4">
            <div><dt className="font-mono text-xs text-[var(--quiet)]">ENTRY</dt><dd className="mt-1 font-mono text-lg font-semibold tabular">$1.50</dd></div>
            <div><dt className="font-mono text-xs text-[var(--quiet)]">MAX SHARES</dt><dd className="mt-1 font-mono text-lg font-semibold tabular">20</dd></div>
            <div><dt className="font-mono text-xs text-[var(--quiet)]">WEIGHT SUM</dt><dd className="mt-1 font-mono text-lg font-semibold tabular">1e18</dd></div>
          </dl>
        </div>

        <div className="relative mx-auto w-full max-w-[31rem]" aria-label="Canopy claim lifecycle preview">
          <div className="absolute -inset-3 border border-[var(--line)]" aria-hidden="true" />
          <div className="relative bg-[var(--panel)] p-4 sm:p-6">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
              <div>
                <p className="font-mono text-xs text-[var(--quiet)]">PRE-IPO SECTOR / 0042</p>
                <p className="mt-1 font-semibold">Private AI basket</p>
              </div>
              <span className="status">Funding</span>
            </div>
            <div className="grid grid-cols-[1fr_auto] items-center gap-6 py-7">
              <div>
                <p className="font-mono text-xs text-[var(--quiet)]">VAULT PROGRESS</p>
                <p className="mt-2 text-4xl font-bold tracking-[-0.05em]">$230 <span className="text-lg text-[var(--quiet)]">/ $250</span></p>
                <div className="mt-4 h-1.5 bg-[var(--line)]"><div className="h-full w-[92%] bg-[var(--leaf)]" /></div>
              </div>
              <img src="/assets/cards/share-sealed.svg" alt="Sealed Canopy Share" width={116} height={174} />
            </div>
            <div className="grid grid-cols-3 gap-px bg-[var(--line)]">
              {[['FUND', 'mUSDC'], ['REVEAL', 'slot hash'], ['CLAIM', 'pro-rata']].map(([label, value]) => (
                <div key={label} className="bg-[var(--ink-2)] p-3">
                  <p className="font-mono text-xs text-[var(--quiet)]">{label}</p>
                  <p className="mt-1 text-sm font-semibold">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--line)] bg-[var(--ink-2)]">
        <div className="shell flex flex-wrap items-center justify-between gap-4 py-4 text-sm">
          <span className="font-mono text-[var(--quiet)]">Market inputs</span>
          <div className="flex flex-wrap gap-x-7 gap-y-2 font-semibold">
            <span>PreStocks</span><span>Pyth Network</span><span>Solana</span><span>Metaplex Core</span>
          </div>
        </div>
      </section>

      <section className="shell py-20">
        <div className="grid gap-10 lg:grid-cols-[.65fr_1.35fr]">
          <div>
            <p className="page-kicker">{isPreStocksSnapshot ? "Official market snapshot" : "Live private markets"}</p>
            <h2 className="mt-4 text-4xl font-bold tracking-[-0.05em]">Start with the spread.</h2>
            <p className="mt-4 text-base leading-7 text-[var(--muted)]">
              Canopy surfaces the difference between each PreStock token and its mark. The thesis travels
              into the Share you mint; settlement stays safely on devnet for the hackathon.
            </p>
            <Link href="/markets" className="btn-secondary mt-6">Open the market desk</Link>
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
            ["Fund", "Deposit into a deterministic PDA vault. Every contribution mints one sealed Core Share."],
            ["Reveal", "Commit, wait ten slots, then normalize deposit-weighted entropy so every claim adds to 1e18."],
            ["Govern", "Established Sectors open bonded PASS/FAIL markets. A time-weighted price decides."],
          ].map(([title, copy]) => (
            <article key={title} className="bg-[var(--panel)] p-7">
              <h2 className="text-xl font-bold">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="shell"><ProgramStatus /></section>
    </div>
  );
}
