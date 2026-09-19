import Link from "next/link"
import ProgramStatus from "./components/ProgramStatus"
import { assets } from "@/assets"

export default function Home() {
  return (
    <div>
      {/* CINEMATIC HERO - full viewport, parallax, pinned vault */}
      <section className="hero" style={{ minHeight: "100vh", paddingTop: "72px" }}>
        <div className="absolute inset-0 -z-10">
          <img src={assets.backgrounds.gridDark} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--color-bg)]" />
          <div className="absolute left-1/2 top-[18%] -translate-x-1/2 w-[720px] h-[420px] bg-[var(--color-primary)] opacity-[0.06] blur-[100px] rounded-full glow-pulse" />
        </div>
        <div>
          <p className="mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-primary)]">The Web3 Terminal · Canopy — Live on devnet</p>
          <h1 className="heading-xl mt-4">Collectible claims<br />on tokenized<br />equity.</h1>
          <p className="body mt-5 max-w-[520px]">Fund a Sector. Mint a sealed Share. When it seals, your Share reveals real vault backing and your ownership % — or Instant Mint a solo vault for $1.50.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/instant" className="btn-primary">Launch app</Link>
            <Link href="/sectors" className="btn-secondary">Explore sectors</Link>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="status live-indicator">Live on devnet</span>
            <span className="mono text-xs text-[var(--color-text-muted)]">mock mUSDC · slot-hash entropy · Core Shares</span>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-3 max-w-[420px]">
            <div className="metric-card !min-h-0 !p-4"><div className="mono text-[10px] text-[var(--color-text-muted)]">INSTANT</div><div className="text-lg font-bold">$1.50</div><div className="mono text-xs text-[var(--color-primary)]">1% fee</div></div>
            <div className="metric-card !min-h-0 !p-4"><div className="mono text-[10px] text-[var(--color-text-muted)]">MAX</div><div className="text-lg font-bold">20</div><div className="mono text-xs text-[var(--color-text-muted)]">shares / grove</div></div>
            <div className="metric-card !min-h-0 !p-4"><div className="mono text-[10px] text-[var(--color-text-muted)]">ENTROPY</div><div className="text-lg font-bold">Slot</div><div className="mono text-xs text-[var(--color-primary)]">hash</div></div>
          </div>
        </div>
        <div className="relative hero-float hidden lg:block">
          <div className="card p-0 overflow-hidden">
            <img src={assets.hero.terminal} alt="Canopy terminal" width={480} height={320} className="w-full h-auto" />
          </div>
          <div className="absolute -bottom-4 -right-4 card p-4 flex items-center gap-3 vault-pulse">
            <img src={assets.illustrations.vault} alt="" width={40} height={40} />
            <div><div className="mono text-xs text-[var(--color-text-muted)]">PDA Vault</div><div className="text-sm font-bold">Backed 1:1</div></div>
          </div>
        </div>
      </section>

      {/* PINNED VAULT SCROLL - cinematic */}
      <section className="container mt-12 grid lg:grid-cols-[380px_1fr] gap-8 items-start">
        <div className="lg:sticky lg:top-[88px] card p-6">
          <img src={assets.illustrations.vault} alt="Vault" width={120} height={120} className="mx-auto" />
          <h3 className="mt-4 text-lg font-semibold text-center">Pinned Vault</h3>
          <p className="body mt-2 text-sm text-center">Stays in view while you scroll — like Sherwood's prism. PDA vault, Core Share, slot-hash.</p>
          <div className="mt-4 h-1 bg-[var(--color-border)] rounded-full overflow-hidden"><div className="h-full w-2/3 bg-[var(--color-primary)]" /></div>
        </div>
        <div className="space-y-6">
          {[
            { k: "01", t: "Ownership for everyone", d: "Every Share is a claim on the vault. Chance sets share size (~0.5×–2×, 1e18) — never zero." },
            { k: "02", t: "Real xStocks on Solana", d: "At seal, vault backed by Token-2022 xStocks via Jupiter. Pyth marks NAV 24/7." },
            { k: "03", t: "Instant Mint", d: "Solo $1.50 micro-vault. Mint + reveal in one tx. 1% to treasury." },
          ].map((s) => (
            <div key={s.k} className="card" style={{ animation: "table-row-in 0.6s ease both", animationTimeline: "view()" } as any}>
              <div className="mono text-xs text-[var(--color-primary)]">{s.k}</div>
              <h3 className="mt-2 text-lg font-semibold">{s.t}</h3>
              <p className="body mt-2 text-sm">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MARKET OVERVIEW - aggressive built */}
      <section className="container mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="heading-lg">Market overview</h2>
          <span className="status live-indicator">Live</span>
        </div>
        <div className="dashboard-grid">
          <div className="metric-card grid-span-3"><div className="flex items-center gap-2"><img src={assets.illustrations.vault} alt="" width={28} height={28} /><span className="mono text-[11px] text-[var(--color-text-muted)]">TOTAL DEPOSITED</span></div><div className="text-2xl font-bold mt-2">$—</div><div className="mono text-xs text-[var(--color-primary)]">↗ devnet</div></div>
          <div className="metric-card grid-span-3"><div className="flex items-center gap-2"><img src={assets.icons.fund} alt="" width={24} height={24} /><span className="mono text-[11px] text-[var(--color-text-muted)]">ACTIVE SECTORS</span></div><div className="text-2xl font-bold mt-2">—</div><div className="mono text-xs text-[var(--color-text-muted)]">Funding / Closed / Revealed</div></div>
          <div className="metric-card grid-span-3"><div className="flex items-center gap-2"><img src={assets.illustrations.entropy} alt="" width={24} height={24} className="entropy-spin" /><span className="mono text-[11px] text-[var(--color-text-muted)]">INSTANT MINTS</span></div><div className="text-2xl font-bold mt-2">$1.50</div><div className="mono text-xs text-[var(--color-primary)]">1% treasury</div></div>
          <div className="metric-card grid-span-3"><div className="flex items-center gap-2"><img src={assets.illustrations.market} alt="" width={24} height={24} /><span className="mono text-[11px] text-[var(--color-text-muted)]">PROTOCOL</span></div><div className="text-2xl font-bold mt-2">Devnet</div><div className="mono text-xs text-[var(--color-text-muted)]">9xmni…Jrnf · BP4h…68k</div></div>
        </div>
      </section>

      {/* FEATURE GRID - with icons */}
      <section className="container mt-12">
        <h2 className="heading-lg">Fund. Reveal. Claim. Govern.</h2>
        <p className="body mt-2 max-w-xl">Sectors pool mUSDC into PDA vaults. Every deposit mints a Share that later reveals a weight. Weights sum to 1e18.</p>
        <div className="dashboard-grid mt-6">
          <div className="card grid-span-3"><div className="flex items-center gap-2"><img src={assets.icons.fund} alt="" width={28} height={28} /><span className="mono text-xs text-[var(--color-primary)]">01</span></div><h3 className="mt-3 text-lg font-semibold">Fund</h3><p className="body mt-2 text-sm">Deposit mUSDC to the vault. Mint a sealed Core Share. Max 20 per Sector.</p></div>
          <div className="card grid-span-3"><div className="flex items-center gap-2"><img src={assets.icons.reveal} alt="" width={28} height={28} /><span className="mono text-xs text-[var(--color-primary)]">02</span></div><h3 className="mt-3 text-lg font-semibold">Reveal</h3><p className="body mt-2 text-sm">Commit slot, wait 10, reveal with future slot hash. 0.5–2.0× rolls.</p></div>
          <div className="card grid-span-3"><div className="flex items-center gap-2"><img src={assets.icons.claim} alt="" width={28} height={28} /><span className="mono text-xs text-[var(--color-primary)]">03</span></div><h3 className="mt-3 text-lg font-semibold">Claim</h3><p className="body mt-2 text-sm">Claim pro-rata <span className="mono">weight * total / 1e18</span>. Burn delegate.</p></div>
          <div className="card grid-span-3"><div className="flex items-center gap-2"><img src={assets.icons.govern} alt="" width={28} height={28} /><span className="mono text-xs text-[var(--color-primary)]">04</span></div><h3 className="mt-3 text-lg font-semibold">Govern</h3><p className="body mt-2 text-sm">Bonded PASS/FAIL markets, TWAP decides.</p></div>
        </div>
      </section>

      {/* ACTIVITY TABLE */}
      <section className="container mt-12">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <h2 className="heading-lg">Open Sectors</h2>
          <Link href="/sectors" className="mono text-sm text-[var(--color-primary)] no-underline hover:underline">View all sectors →</Link>
        </div>
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead><tr><th>Sector</th><th>Raised</th><th>Goal</th><th>Shares</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {[
                  { name: "AI Infra", raised: "$68", goal: "$100", shares: "2", status: "Funding" },
                  { name: "Energy Vault", raised: "$230", goal: "$250", shares: "4", status: "Funding" },
                  { name: "Bio Forge", raised: "$23", goal: "$75", shares: "1", status: "Funding" },
                ].map((r) => (
                  <tr key={r.name} className="table-row-in">
                    <td className="font-semibold">{r.name}</td>
                    <td className="mono">{r.raised}</td>
                    <td className="mono">{r.goal}</td>
                    <td className="mono">{r.shares}</td>
                    <td><span className="status">{r.status}</span></td>
                    <td><Link href="/sectors" className="btn-compact btn-secondary no-underline">Fund sector</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* PROTOCOL STATUS */}
      <section className="container mt-12">
        <ProgramStatus />
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
