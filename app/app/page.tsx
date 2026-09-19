import Link from "next/link"
import ProgramStatus from "./components/ProgramStatus"

const facts = [
  { value: "$1.50", label: "Instant Mint" },
  { value: "20", label: "max shares / grove" },
  { value: "0.5–2×", label: "weight range" },
]

const why = [
  { kicker: "01", title: "Ownership for everyone", body: "Every Share is a claim on the vault. Chance sets share size (~0.5×–2× deposit weight, normalized to 1e18) — never zero." },
  { kicker: "02", title: "Real xStocks on Solana", body: "At seal, vault is backed by Token-2022 xStocks (NVDA, AAPL, TSLA…) via Jupiter. Pyth marks NAV 24/7." },
  { kicker: "03", title: "Instant Mint", body: "Bankroll a solo $1.50 micro-vault. No waiting: mint + reveal in one tx. 1% to treasury, 99% backing." },
  { kicker: "04", title: "Solana native", body: "Metaplex Core single-account Shares, sub-cent fees, slot-hash entropy. No EVM bridge needed." },
  { kicker: "05", title: "Trade or claim", body: "Revealed Shares show ownership % and rarity. Claim pro-rata or list the Share — claim stays attached." },
  { kicker: "06", title: "Govern by market", body: "Revealed Sectors govern via futarchy: bonded PASS/FAIL markets, TWAP decides. Silence keeps status quo." },
]

const steps = [
  { number: "01", label: "Fund", title: "Join a Sector or Instant Mint.", copy: "Sectors take many deposits. Instant Mint is a $1.50 solo vault you bankroll yourself — 1% fee, PDA vault, Core Share.", symbols: ["NVDA", "AAPL"] },
  { number: "02", label: "Seal", title: "The vault locks. Entropy commits.", copy: "At goal, anyone may Seal. Commit the close slot, wait 10 slots, then Reveal rolls weights from a future slot hash.", symbols: ["TSLA", "MSFT"] },
  { number: "03", label: "Reveal", title: "See your ownership %.", copy: "Reveal assigns rarity and weight (~0.5×–2×, 1e18 total). Claim your share of the vault or govern it via futarchy.", symbols: ["SPY", "GME"] },
]

const faqs = [
  { q: "What do I need to fund?", a: "Phantom/Backpack on devnet, mUSDC (faucet gives 10 mUSDC + 0.05 SOL). Mainnet will use USDC + xStocks via Jupiter." },
  { q: "What is Instant Mint?", a: "A $1.50 solo vault you fully bankroll. No goal to hit — you mint + reveal in one tx, weight always 1e18 (Legendary), DNA still unique." },
  { q: "What does the sealed Share represent?", a: "It records your deposit and vault claim. After Reveal it shows ownership %, rarity, and backing. Core Attributes: sealed→revealed→claimed." },
  { q: "Do I choose the stocks?", a: "No. You choose Sector/amount. At seal the vault is backed 1:1 by the Sector’s quote (mUSDC on devnet, xStocks basket on mainnet)." },
  { q: "Can the vault value fall?", a: "Yes. Value tracks xStocks. Canopy is experimental — you can lose some or all of what you deposit. Not audited." },
  { q: "Is Canopy audited?", a: "No external audit. Programs are 9xmni…Jrnf + BP4h…68k on devnet. Review code, fees, and txs before funding." },
]

export default function Home() {
  return (
    <div data-landing>
      {/* HERO - Sherwood CinematicHero adapted for Canopy */}
      <section className="relative isolate min-h-[min(100svh,56rem)] overflow-hidden border-b border-[var(--canopy-line)] bg-black pb-12 pt-24 sm:pb-16 sm:pt-28 lg:flex lg:min-h-[72vh] lg:items-center">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute inset-y-0 left-1/2 w-px bg-white/10" />
          <div className="absolute left-[8%] top-[18%] size-72 rounded-full bg-[var(--canopy-lime)]/[0.06] blur-3xl" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent" />
          <div className="absolute inset-0 opacity-[0.28]" style={{ backgroundImage: `linear-gradient(to right, hsla(0,0%,100%,.04) 1px, transparent 1px), linear-gradient(to bottom, hsla(0,0%,100%,.04) 1px, transparent 1px)`, backgroundSize: "4rem 4rem", maskImage: "linear-gradient(to bottom, black, transparent 85%)" }} />
        </div>
        <div className="mx-auto relative z-10 grid max-w-[1280px] w-full gap-10 px-4 sm:px-6 lg:px-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(26rem,1.05fr)] lg:gap-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--canopy-lime)]">
              Solana · Tokenized equity <span className="mx-2 inline-block h-px w-6 translate-y-[-3px] bg-[var(--canopy-lime)]/50 align-middle" /> <span className="text-[var(--canopy-muted)]">Devnet live</span>
            </p>
            <h1 className="mt-6 max-w-3xl text-[clamp(2.75rem,7vw,5.25rem)] font-semibold leading-[0.92] tracking-[-0.055em] text-white">
              Own the vault.
              <span className="mt-1 block text-[var(--canopy-lime)]">Reveal your share.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-[var(--canopy-muted)] sm:text-lg sm:leading-8">
              Fund a Sector. Get a sealed Share. When it seals, your Share reveals real vault backing and your ownership % — or Instant Mint a solo vault for $1.50.
            </p>
            <div className="mt-8 flex flex-col gap-3 min-[420px]:flex-row">
              <Link href="/instant" className="group inline-flex h-12 min-w-44 items-center justify-between gap-5 rounded-full bg-[var(--canopy-lime)] px-5 text-sm font-bold text-black hover:brightness-110">Instant Mint <span className="transition-transform group-hover:translate-x-1">→</span></Link>
              <Link href="/sectors" className="inline-flex h-12 min-w-40 items-center justify-center rounded-full border border-white/25 bg-transparent px-5 text-sm font-semibold text-white hover:bg-white/5">Explore Sectors →</Link>
            </div>
            <div className="mt-10 flex max-w-xl flex-wrap gap-x-10 gap-y-4">
              {facts.map((f) => (
                <div key={f.label} className="min-w-20">
                  <p className="text-2xl font-semibold tabular-nums text-white sm:text-3xl">{f.value}</p>
                  <p className="mt-1 text-xs text-[#888]">{f.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <div className="relative overflow-hidden rounded-[18px] border border-white/10 bg-[#0f0f0f] p-6 sm:p-8">
              <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[var(--canopy-lime)]/10 to-transparent" />
              <div className="relative mx-auto max-w-[16rem]">
                <div className="aspect-[2/3] rounded-xl border border-white/10 bg-[#111] grid place-items-center overflow-hidden">
                  <img src="/mark.svg" alt="" width={64} height={64} className="opacity-30" />
                  <span className="absolute bottom-3 left-3 rounded-full bg-[var(--canopy-lime)] px-2.5 py-1 text-[10px] font-bold tracking-widest text-black">SEALED</span>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl border border-white/10 bg-black/40 p-3"><div className="text-[10px] tracking-widest text-white/50">TYPE</div><div className="text-sm font-bold">Share</div></div>
                <div className="rounded-xl border border-white/10 bg-black/40 p-3"><div className="text-[10px] tracking-widest text-white/50">BACKING</div><div className="text-sm font-bold">mUSDC</div></div>
                <div className="rounded-xl border border-[var(--canopy-lime)]/30 bg-[var(--canopy-lime)]/10 p-3"><div className="text-[10px] tracking-widest text-black/60">STATUS</div><div className="text-sm font-bold text-black">Reveal</div></div>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-white/50"><span>Metaplex Core · PDA vault</span><span className="text-[var(--canopy-lime)]">● slot-hash</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE SECTORS */}
      <section className="mx-auto max-w-[1280px] w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--canopy-lime)]">On chain now</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">Open Sectors</h2>
          </div>
          <Link href="/sectors" className="inline-flex items-center text-sm font-semibold text-[var(--canopy-lime)] hover:underline">View all Sectors →</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { name: "AI Infra", goal: "$100", meta: "2 shares · 68% filled", desc: "Pre-IPO compute + models" },
            { name: "Energy Vault", goal: "$250", meta: "4 shares · 92% filled", desc: "Tokenized grids + batteries" },
            { name: "Bio Forge", goal: "$75", meta: "1 share · 31% filled", desc: "Longevity + lab assets" },
          ].map((s) => (
            <Link key={s.name} href="/sectors" className="group rounded-[18px] border border-white/10 bg-[#0f0f0f] p-5 no-underline transition-colors hover:border-[var(--canopy-lime)]/40">
              <div className="mb-3 flex items-center justify-between">
                <span className="inline-flex h-6 items-center rounded-full bg-[var(--canopy-lime)] px-2.5 text-[10px] font-bold text-black">{s.goal} goal</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--canopy-lime)]">Funding</span>
              </div>
              <p className="text-lg font-bold text-white">{s.name}</p>
              <p className="mt-1 text-xs text-white/50">{s.meta} · {s.desc}</p>
              <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[68%] rounded-full bg-[var(--canopy-lime)]" /></div>
              <p className="mt-3 text-xs text-white/50 group-hover:text-white">Fund → mint sealed Share</p>
            </Link>
          ))}
        </div>
        <div className="mt-6 rounded-[18px] border border-white/10 bg-[#0f0f0f] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
          <div><h3 className="text-xl font-semibold">No open Sector matches your filter?</h3><p className="mt-1 text-sm text-white/60">Create one: set goal, deadline, min. Permissionless. Or use Instant for a solo vault.</p></div>
          <Link href="/sectors" className="inline-flex h-11 items-center rounded-full bg-[var(--canopy-lime)] px-5 text-sm font-bold text-black">Open a Sector</Link>
        </div>
      </section>

      {/* WHY CANOPY */}
      <section className="border-y border-white/10 bg-[#0f0f0f]/50">
        <div className="mx-auto max-w-[1280px] w-full px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="mb-12 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--canopy-lime)]">Why Canopy</p>
            <h2 className="mt-4 text-4xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-5xl lg:text-6xl">Collectible finance.<span className="block text-white/40">Not a raffle.</span></h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/60">Sectors pool mUSDC (and later xStocks) into PDA vaults. Every deposit mints a Share that later reveals a weight. Weights always sum to 100%.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {why.map((u) => (
              <div key={u.kicker} className="rounded-[18px] border border-white/10 bg-[#111] p-6 sm:p-7">
                <p className="font-mono text-[11px] text-[var(--canopy-lime)]">{u.kicker}</p>
                <h3 className="mt-2 text-xl font-semibold text-white">{u.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/60">{u.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="mx-auto max-w-[1280px] w-full px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-[minmax(17rem,0.72fr)_minmax(0,1.28fr)] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--canopy-lime)]">The flow</p>
            <h2 className="mt-4 max-w-md text-4xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-5xl">Deposit once.<span className="block text-white/40">Own a slice.</span></h2>
            <p className="mt-5 max-w-md text-base leading-7 text-white/60">No ticker picking at mint. Choose Sector or Instant, fund, wait for seal — your Share carries the claim.</p>
            <Link href="/sectors" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--canopy-lime)] hover:underline">Explore Sectors →</Link>
          </div>
          <ol className="border-t border-white/10">
            {steps.map((s) => (
              <li key={s.number} className="grid gap-5 border-b border-white/10 py-8 sm:grid-cols-[5rem_minmax(0,1fr)_auto] sm:items-center sm:py-10">
                <div><p className="font-mono text-xs text-[var(--canopy-lime)]">{s.number}</p><p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/40">{s.label}</p></div>
                <div><h3 className="text-xl font-semibold sm:text-2xl">{s.title}</h3><p className="mt-2 max-w-xl text-sm leading-6 text-white/60 sm:text-base">{s.copy}</p></div>
                <div className="flex gap-1 sm:justify-end">{s.symbols.map((sym) => (<span key={sym} className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#111] border border-white/10 text-[10px] font-bold">{sym[0]}</span>))}</div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* AFTER REVEAL */}
      <section className="border-y border-white/10 bg-[#0f0f0f]/50">
        <div className="mx-auto max-w-[1280px] w-full px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="mb-10 grid gap-5 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--canopy-lime)]">After reveal</p>
              <h2 className="mt-4 max-w-3xl text-4xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-5xl lg:text-6xl">A Share you can read,<span className="block text-white/40">price, claim, or trade.</span></h2>
            </div>
            <p className="max-w-md text-base leading-7 text-white/60 lg:justify-self-end">The sealed Share becomes a clear ownership record. It shows the Sector, your % (weight/1e18), rarity, and backing.</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-[minmax(18rem,0.78fr)_minmax(0,1.22fr)]">
            <div className="rounded-[18px] border border-white/10 bg-[#111] p-6 sm:p-8 relative overflow-hidden min-h-[28rem] grid place-items-center">
              <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[var(--canopy-lime)]/10 to-transparent" />
              <div className="relative w-[16rem] aspect-[2/3] rounded-xl border border-white/10 bg-black grid place-items-center"><img src="/mark.svg" alt="" width={56} height={56} className="opacity-20" /><span className="absolute bottom-3 left-3 rounded-full bg-[var(--canopy-lime)] px-2 py-1 text-[10px] font-bold text-black">REVEALED · 6.42%</span><span className="absolute top-3 right-3 rounded-full border border-white/20 bg-black/60 px-2 py-1 text-[10px] font-bold">Epic</span></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[18px] border border-white/10 bg-[#111] p-6 sm:p-8"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--canopy-lime)]">Known ownership</p><p className="mt-5 text-5xl font-semibold tracking-[-0.05em]">6.42%</p><p className="mt-3 text-sm leading-6 text-white/60">Revealed Shares show the exact % used when you claim the vault.</p></div>
              <div className="rounded-[18px] border border-white/10 bg-[#111] p-6 sm:p-8"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--canopy-lime)]">Several stocks</p><div className="mt-5 flex gap-1"><span className="h-10 w-10 rounded-full bg-white/10 grid place-items-center text-xs">N</span><span className="h-10 w-10 rounded-full bg-white/10 grid place-items-center text-xs">A</span><span className="h-10 w-10 rounded-full bg-white/10 grid place-items-center text-xs">T</span></div><p className="mt-4 text-sm leading-6 text-white/60">One claim sends your share of every token held.</p></div>
              <div className="rounded-[18px] border border-white/10 bg-[#111] p-6 sm:p-8 sm:col-span-2">
                <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--canopy-lime)]">Claim preview</p><h3 className="mt-3 text-2xl font-semibold">See the tokens before you claim.</h3></div><span className="rounded-lg border border-[var(--canopy-lime)]/30 bg-[var(--canopy-lime)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--canopy-lime)]">Epic</span></div>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">{[["NVDA","0.0328"],["AAPL","0.1184"],["TSLA","0.0712"]].map(([sym, amt]) => (<div key={sym} className="rounded-xl border border-white/10 bg-black p-4"><div className="text-xs text-white/40">{sym}</div><div className="mt-2 font-mono text-sm">{amt}</div></div>))}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE PROTOCOL STATUS + CTA */}
      <section className="mx-auto max-w-[1280px] w-full px-4 sm:px-6 lg:px-8 py-12">
        <ProgramStatus />
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-[1280px] w-full px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-[minmax(16rem,0.65fr)_minmax(0,1.35fr)] lg:gap-20">
          <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--canopy-lime)]">Before you fund</p><h2 className="mt-4 text-4xl font-semibold leading-none tracking-[-0.045em] sm:text-5xl">Clear answers.<span className="block text-white/40">No hidden steps.</span></h2><p className="mt-5 max-w-sm text-sm leading-6 text-white/60">Balances, fees, exits, and trading — all on chain.</p><Link href="/sectors" className="mt-5 inline-flex text-sm font-semibold text-[var(--canopy-lime)] hover:underline">Open sectors →</Link></div>
          <div className="border-t border-white/10">
            {faqs.map((f) => (
              <details key={f.q} className="group border-b border-white/10">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left text-base font-semibold sm:py-6 sm:text-lg [&::-webkit-details-marker]:hidden">{f.q}<span className="text-[var(--canopy-lime)] group-open:rotate-45 transition-transform">+</span></summary>
                <p className="max-w-2xl pb-6 pr-10 text-sm leading-6 text-white/60 sm:text-base sm:leading-7">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-[1280px] w-full px-4 sm:px-6 lg:px-8 pb-20 sm:pb-28">
        <div className="relative overflow-hidden rounded-2xl border border-[var(--canopy-lime)]/35 bg-[var(--canopy-lime)] p-6 text-black sm:p-10 lg:p-14">
          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em]">Your first Share starts with one Sector.</p>
              <h2 className="mt-4 max-w-4xl text-4xl font-semibold leading-[0.95] tracking-[-0.05em] sm:text-5xl lg:text-6xl">Choose the Sector. Set the amount. See what your Share reveals.</h2>
            </div>
            <div className="flex flex-col gap-3 min-[420px]:flex-row lg:flex-col">
              <Link href="/sectors" className="inline-flex h-12 min-w-44 items-center justify-center rounded-full bg-black px-5 text-sm font-bold text-white hover:bg-black/90">Explore Sectors →</Link>
              <Link href="/instant" className="inline-flex h-12 min-w-44 items-center justify-center rounded-full border border-black/25 bg-transparent px-5 text-sm font-bold text-black hover:bg-black/10">Instant Mint</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
