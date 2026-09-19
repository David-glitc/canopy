import Link from "next/link"
import ProgramStatus from "./components/ProgramStatus"
import { AnimatedHero, HeroTerminal } from "./components/animations/AnimatedHero"
import { AnimatedCard, AnimatedMetric } from "./components/animations/AnimatedCard"
import { assets } from "@/assets"

const why = [
  { kicker: "01", title: "Ownership for everyone", body: "Every Share is a claim on the vault. Chance sets share size (~0.5×–2× deposit weight, normalized to 1e18) — never zero." },
  { kicker: "02", title: "Real xStocks on Solana", body: "At seal, vault is backed by Token-2022 xStocks (NVDA, AAPL, TSLA…) via Jupiter. Pyth marks NAV 24/7." },
  { kicker: "03", title: "Instant Mint", body: "Bankroll a solo $1.50 micro-vault. No waiting: mint + reveal in one tx. 1% to treasury, 99% backing." },
  { kicker: "04", title: "Solana native", body: "Metaplex Core single-account Shares, sub-cent fees, slot-hash entropy. No EVM bridge needed." },
  { kicker: "05", title: "Trade or claim", body: "Revealed Shares show ownership % and rarity. Claim pro-rata or list the Share — claim stays attached." },
  { kicker: "06", title: "Govern by market", body: "Revealed Sectors govern via futarchy: bonded PASS/FAIL markets, TWAP decides. Silence keeps status quo." },
]

const steps = [
  { number: "01", label: "Fund", title: "Join a Sector or Instant Mint.", copy: "Sectors take many deposits. Instant Mint is a $1.50 solo vault you bankroll yourself — 1% fee, PDA vault, Core Share." },
  { number: "02", label: "Seal", title: "The vault locks. Entropy commits.", copy: "At goal, anyone may Seal. Commit the close slot, wait 10 slots, then Reveal rolls weights from a future slot hash." },
  { number: "03", label: "Reveal", title: "See your ownership %.", copy: "Reveal assigns rarity and weight (~0.5×–2×, 1e18 total). Claim your share of the vault or govern it via futarchy." },
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
    <div>
      {/* HERO - Dark Web3 Terminal with massive assets + animations */}
      <AnimatedHero>
        <section className="hero grid-move">
          <div>
            <p className="mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-primary)]">The Web3 Terminal · Canopy</p>
            <h1 className="heading-xl mt-4 max-w-[640px]">Collectible claims<br />on tokenized equity.</h1>
            <p className="body mt-5 max-w-[520px]">Fund a Sector. Get a sealed Share. When it seals, your Share reveals real vault backing and your ownership % — or Instant Mint a solo vault for $1.50.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/instant" className="btn-primary">Launch app</Link>
              <Link href="/sectors" className="btn-secondary">Explore sectors</Link>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-2 text-[11px] font-mono text-[var(--color-text-muted)]">
              <span className="status live-indicator">Live on devnet</span>
              <span>mock mUSDC · slot-hash entropy · Core Shares</span>
              <img src={assets.icons.solana} alt="" width={16} height={16} className="ml-1 opacity-60" />
            </div>
          </div>
          <div className="relative hidden lg:block hero-float">
            <HeroTerminal />
          </div>
        </section>
      </AnimatedHero>

      {/* MARKET OVERVIEW - animated metrics with massive assets */}
      <section className="container mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="heading-lg">Market overview</h2>
          <span className="status live-indicator">Live</span>
        </div>
        <div className="dashboard-grid">
          <AnimatedMetric index={0}><div className="flex items-center gap-2"><img src={assets.illustrations.vault} alt="" width={32} height={32} /><span className="mono text-[11px] tracking-widest text-[var(--color-text-muted)]">TOTAL DEPOSITED</span></div><div className="text-2xl font-bold mt-2">$—</div><div className="mono text-xs text-[var(--color-primary)]">↗ devnet</div><div className="text-xs text-[var(--color-text-muted)]">Across all Sectors</div></AnimatedMetric>
          <AnimatedMetric index={1}><div className="flex items-center gap-2"><img src={assets.icons.fund} alt="" width={24} height={24} /><span className="mono text-[11px] tracking-widest text-[var(--color-text-muted)]">ACTIVE SECTORS</span></div><div className="text-2xl font-bold mt-2">—</div><div className="mono text-xs text-[var(--color-text-muted)]">Funding / Closed / Revealed</div><div className="text-xs text-[var(--color-text-muted)]">Max 20 shares / Sector</div></AnimatedMetric>
          <AnimatedMetric index={2}><div className="flex items-center gap-2"><img src={assets.illustrations.entropy} alt="" width={24} height={24} className="entropy-spin" /><span className="mono text-[11px] tracking-widest text-[var(--color-text-muted)]">INSTANT MINTS</span></div><div className="text-2xl font-bold mt-2">$1.50</div><div className="mono text-xs text-[var(--color-primary)]">1% treasury</div><div className="text-xs text-[var(--color-text-muted)]">Solo vaults, instant reveal</div></AnimatedMetric>
          <AnimatedMetric index={3}><div className="flex items-center gap-2"><img src={assets.illustrations.market} alt="" width={24} height={24} /><span className="mono text-[11px] tracking-widest text-[var(--color-text-muted)]">PROTOCOL</span></div><div className="text-2xl font-bold mt-2">Devnet</div><div className="mono text-xs text-[var(--color-text-muted)]">9xmni…Jrnf · BP4h…68k</div><div className="text-xs text-[var(--color-text-muted)]">Jupiter + Pyth ready</div></AnimatedMetric>
        </div>
      </section>

      {/* FEATURE GRID - with icons and massive animations */}
      <section className="container mt-12">
        <h2 className="heading-lg">Fund. Reveal. Claim. Govern.</h2>
        <p className="body mt-2 max-w-xl">Sectors pool mUSDC (later xStocks) into PDA vaults. Every deposit mints a Share that later reveals a weight. Weights sum to 1e18.</p>
        <div className="dashboard-grid mt-6">
          <AnimatedCard index={0} className="card grid-span-3 card-idle-float"><div className="flex items-center gap-2"><img src={assets.icons.fund} alt="" width={28} height={28} /><span className="mono text-[11px] text-[var(--color-primary)]">01</span></div><h3 className="mt-3 text-lg font-semibold">Fund</h3><p className="body mt-2 text-sm">Deposit mUSDC to the Sector vault. Mint a sealed Core Share. Max 20 per Sector, one tx per Share.</p></AnimatedCard>
          <AnimatedCard index={1} className="card grid-span-3 card-idle-float" style={{ animationDelay: "0.2s" } as any}><div className="flex items-center gap-2"><img src={assets.icons.reveal} alt="" width={28} height={28} /><span className="mono text-[11px] text-[var(--color-primary)]">02</span></div><h3 className="mt-3 text-lg font-semibold">Reveal</h3><p className="body mt-2 text-sm">Close on goal. Commit slot, wait 10, reveal with future slot hash. 0.5–2.0× rolls normalized to 1e18.</p></AnimatedCard>
          <AnimatedCard index={2} className="card grid-span-3"><div className="flex items-center gap-2"><img src={assets.icons.claim} alt="" width={28} height={28} /><span className="mono text-[11px] text-[var(--color-primary)]">03</span></div><h3 className="mt-3 text-lg font-semibold">Claim</h3><p className="body mt-2 text-sm">Revealed Shares claim pro-rata <span className="mono">weight * total / 1e18</span> from vault. Burn delegate, no custody.</p></AnimatedCard>
          <AnimatedCard index={3} className="card grid-span-3"><div className="flex items-center gap-2"><img src={assets.icons.govern} alt="" width={28} height={28} /><span className="mono text-[11px] text-[var(--color-primary)]">04</span></div><h3 className="mt-3 text-lg font-semibold">Govern</h3><p className="body mt-2 text-sm">Revealed Sectors govern via futarchy: bonded PASS/FAIL markets, TWAP decides. Silence keeps status quo.</p></AnimatedCard>
        </div>
      </section>

      {/* LIVE SECTORS + ACTIVITY TABLE */}
      <section className="container mt-12">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <h2 className="heading-lg">Open Sectors</h2>
          <Link href="/sectors" className="mono text-sm text-[var(--color-primary)] no-underline hover:underline">View all sectors →</Link>
        </div>
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Sector</th>
                  <th>Raised</th>
                  <th>Goal</th>
                  <th>Shares</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "AI Infra", raised: "$68", goal: "$100", shares: "2", status: "Funding" },
                  { name: "Energy Vault", raised: "$230", goal: "$250", shares: "4", status: "Funding" },
                  { name: "Bio Forge", raised: "$23", goal: "$75", shares: "1", status: "Funding" },
                ].map((r) => (
                  <tr key={r.name}>
                    <td className="font-semibold">{r.name}</td>
                    <td className="mono">{r.raised}</td>
                    <td className="mono">{r.goal}</td>
                    <td className="mono">{r.shares}</td>
                    <td><span className="status">{r.status}</span></td>
                    <td><Link href="/sectors" className="btn-compact btn-secondary no-underline">Fund</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className="mono text-xs text-[var(--color-text-muted)] mt-3">Mock mUSDC on devnet. Mainnet USDC + xStocks via Jupiter. <Link href="/sectors" className="text-[var(--color-primary)]">Create a Sector</Link> or <Link href="/instant" className="text-[var(--color-primary)]">Instant Mint</Link>.</p>
      </section>

      {/* WHY CANOPY - animated with massive assets */}
      <section className="container mt-12">
        <h2 className="heading-lg">Why Canopy</h2>
        <p className="body mt-2 max-w-xl">Collectible finance, not a raffle. Weights always sum to 100%. Backing is real, on-chain, and pro-rata.</p>
        <div className="dashboard-grid mt-6">
          {why.map((u, i) => (
            <AnimatedCard key={u.kicker} index={i} className="card grid-span-4">
              <div className="mono text-[11px] text-[var(--color-primary)]">{u.kicker}</div>
              <h3 className="mt-2 text-lg font-semibold">{u.title}</h3>
              <p className="body mt-2 text-sm">{u.body}</p>
            </AnimatedCard>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS - detailed */}
      <section className="container mt-12">
        <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="mono text-xs tracking-[0.16em] text-[var(--color-primary)]">The flow</p>
            <h2 className="heading-lg mt-4 max-w-md">Deposit once.<span className="block text-[var(--color-text-secondary)]">Own a slice.</span></h2>
            <p className="body mt-4 max-w-md">No ticker picking at mint. Choose Sector or Instant, fund, wait for seal — your Share carries the claim.</p>
            <Link href="/sectors" className="mono mt-6 inline-flex text-sm font-semibold text-[var(--color-primary)] hover:underline">Explore Sectors →</Link>
          </div>
          <ol className="border-t border-[var(--color-border)]">
            {steps.map((s) => (
              <li key={s.number} className="grid gap-5 border-b border-[var(--color-border)] py-8 sm:grid-cols-[5rem_1fr] sm:items-center">
                <div><p className="mono text-xs text-[var(--color-primary)]">{s.number}</p><p className="mono mt-1 text-xs uppercase tracking-[0.16em] text-[var(--color-text-muted)]">{s.label}</p></div>
                <div><h3 className="text-xl font-semibold">{s.title}</h3><p className="body mt-2 text-sm">{s.copy}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* AFTER REVEAL */}
      <section className="container mt-12">
        <div className="card">
          <div className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
            <div className="rounded-[18px] border border-[var(--color-border)] bg-[#080909] p-6 grid place-items-center min-h-[28rem]">
              <div className="w-[16rem] aspect-[2/3] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] grid place-items-center relative overflow-hidden">
                <img src="/mark.svg" alt="" width={56} height={56} className="opacity-20" />
                <span className="absolute bottom-3 left-3 rounded-full bg-[var(--color-primary)] px-2 py-1 text-[10px] font-bold text-black">REVEALED · 6.42%</span>
                <span className="absolute top-3 right-3 rounded-full border border-white/20 bg-black/60 px-2 py-1 text-[10px] font-bold">Epic</span>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="card"><p className="mono text-xs tracking-[0.16em] text-[var(--color-primary)]">Known ownership</p><p className="mt-4 text-4xl font-bold tracking-[-0.05em]">6.42%</p><p className="body mt-2 text-sm">Revealed Shares show the exact % used when you claim.</p></div>
              <div className="card"><p className="mono text-xs tracking-[0.16em] text-[var(--color-primary)]">Several stocks</p><div className="mt-4 flex gap-1"><span className="h-10 w-10 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] grid place-items-center text-xs">N</span><span className="h-10 w-10 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] grid place-items-center text-xs">A</span><span className="h-10 w-10 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] grid place-items-center text-xs">T</span></div><p className="body mt-3 text-sm">One claim sends your share of every token held.</p></div>
              <div className="card sm:col-span-2">
                <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="mono text-xs tracking-[0.16em] text-[var(--color-primary)]">Claim preview</p><h3 className="mt-2 text-xl font-semibold">See the tokens before you claim.</h3></div><span className="rounded-lg border border-[var(--color-primary)]/30 bg-[var(--color-primary-muted)] px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)]">Epic</span></div>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">{[["NVDA","0.0328"],["AAPL","0.1184"],["TSLA","0.0712"]].map(([sym,amt]) => (<div key={sym} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4"><div className="mono text-xs text-[var(--color-text-muted)]">{sym}</div><div className="mono mt-2 text-sm">{amt}</div></div>))}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROTOCOL STATUS */}
      <section className="container mt-12">
        <ProgramStatus />
      </section>

      {/* FAQ */}
      <section className="container mt-12">
        <div className="grid gap-12 lg:grid-cols-[0.65fr_1.35fr] lg:gap-20">
          <div><p className="mono text-xs tracking-[0.16em] text-[var(--color-primary)]">Before you fund</p><h2 className="heading-lg mt-4">Clear answers.<span className="block text-[var(--color-text-secondary)]">No hidden steps.</span></h2><p className="body mt-4 max-w-sm">Balances, fees, exits, and trading — all on chain.</p></div>
          <div className="border-t border-[var(--color-border)]">
            {faqs.map((f) => (
              <details key={f.q} className="group border-b border-[var(--color-border)]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left text-base font-semibold sm:py-6 [&::-webkit-details-marker]:hidden">{f.q}<span className="text-[var(--color-primary)] group-open:rotate-45 transition-transform">+</span></summary>
                <p className="body pb-6 pr-10 text-sm">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mt-12 mb-12">
        <div className="relative overflow-hidden rounded-2xl border border-[var(--color-primary)]/35 bg-[var(--color-primary)] p-6 text-black sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="mono text-xs tracking-[0.16em]">Your first Share starts with one Sector.</p>
              <h2 className="mt-4 max-w-4xl text-4xl font-bold leading-[0.95] tracking-[-0.05em] sm:text-5xl">Choose the Sector. Set the amount. See what your Share reveals.</h2>
            </div>
            <div className="flex flex-col gap-3 min-[420px]:flex-row lg:flex-col">
              <Link href="/sectors" className="inline-flex h-12 min-w-44 items-center justify-center rounded-full bg-black px-5 text-sm font-bold text-white hover:bg-black/90">Explore sectors →</Link>
              <Link href="/instant" className="inline-flex h-12 min-w-44 items-center justify-center rounded-full border border-black/25 bg-transparent px-5 text-sm font-bold text-black hover:bg-black/10">Instant mint</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
