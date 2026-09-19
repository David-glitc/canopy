import Link from "next/link"
import ProgramStatus from "./components/ProgramStatus"
import { assets } from "@/assets"

export default function Home() {
  return (
    <div>
      {/* HERO - built, left-aligned, bento */}
      <section className="hero">
        <div className="text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-primary)]/20 bg-[var(--color-primary-muted)] px-3 py-1.5">
            <span className="size-2 rounded-full bg-[var(--color-primary)] live-indicator" />
            <span className="mono text-[11px] font-semibold tracking-[0.08em] text-[var(--color-primary)]">LIVE ON DEVNET</span>
            <span className="mono text-[11px] text-[var(--color-text-muted)]">· Solana</span>
          </div>
          <h1 className="heading-xl mt-6 text-left text-balance">
            Collectible<br />
            <span className="bg-gradient-to-r from-[#14f195] via-[#14f195] to-[#9945FF] bg-clip-text text-transparent">claims on</span><br />
            tokenized equity.
          </h1>
          <p className="body mt-5 max-w-[480px] text-left text-pretty">Fund a Sector. Mint a sealed Share. Reveal how much of the vault you own — then govern it by market. One vault, 20 shares max, slot-hash entropy.</p>
          <div className="mt-8 flex flex-wrap gap-3 justify-start">
            <Link href="/instant" className="btn-primary">Launch app</Link>
            <Link href="/sectors" className="btn-secondary">Explore sectors</Link>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3 justify-start">
            <span className="status live-indicator">Live on devnet</span>
            <span className="mono text-xs text-[var(--color-text-muted)]">mock mUSDC · slot-hash entropy · Core Shares</span>
          </div>
        </div>
        <div className="relative hidden lg:block">
          <div className="card p-0 overflow-hidden">
            <div className="h-9 flex items-center gap-2 px-4 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
              <span className="size-3 rounded-full bg-[#ff5c7a]" /><span className="size-3 rounded-full bg-[#f5c451]" /><span className="size-3 rounded-full bg-[var(--color-primary)]" />
              <span className="mono text-xs text-[var(--color-text-muted)] ml-2">canopy — devnet • PDA vault</span>
              <span className="ml-auto status text-[10px]">Sealed</span>
            </div>
            <img src={assets.hero.terminal} alt="" width={480} height={320} className="w-full h-auto" />
            <div className="grid grid-cols-3 gap-2 p-4 bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)]">
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3 text-center"><div className="mono text-[10px] text-[var(--color-text-muted)]">TYPE</div><div className="text-xs font-bold mt-1">Core Share</div></div>
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3 text-center"><div className="mono text-[10px] text-[var(--color-text-muted)]">BACKING</div><div className="text-xs font-bold mt-1">mUSDC</div></div>
              <div className="rounded-xl border border-[var(--color-primary)]/30 bg-[var(--color-primary-muted)] p-3 text-center"><div className="mono text-[10px] text-[var(--color-text-muted)]">STATUS</div><div className="text-xs font-bold text-[var(--color-primary)]">Reveal →</div></div>
            </div>
          </div>
          <div className="absolute -bottom-4 -right-4 card p-3 flex items-center gap-3 shadow-xl vault-pulse hidden xl:flex">
            <img src={assets.illustrations.vault} alt="" width={36} height={36} />
            <div><div className="mono text-xs text-[var(--color-text-muted)]">VAULT</div><div className="text-sm font-bold">Backed 1:1 · PDA</div></div>
          </div>
        </div>
      </section>

      {/* MARKET OVERVIEW - built metric grid */}
      <section className="container">
        <div className="flex items-end justify-between mb-6">
          <h2 className="heading-lg text-balance text-left">Market overview</h2>
          <span className="status live-indicator">Live • devnet</span>
        </div>
        <div className="dashboard-grid">
          <div className="metric-card grid-span-3"><div className="flex items-center gap-2"><img src={assets.illustrations.vault} alt="" width={20} height={20} /><span className="mono text-[11px] text-[var(--color-text-muted)]">TOTAL DEPOSITED</span></div><div className="text-3xl font-bold tracking-[-0.02em] tabular-nums">$—</div><div className="h-6 w-full"><svg viewBox="0 0 100 24" className="w-full h-full"><path d="M0 18 L20 14 L40 16 L60 8 L80 12 L100 4" className="chart-line" fill="none"/><path d="M0 18 L20 14 L40 16 L60 8 L80 12 L100 4 L100 24 L0 24 Z" className="chart-area"/></svg></div><div className="mono text-xs text-[var(--color-primary)]">↗ devnet</div></div>
          <div className="metric-card grid-span-3"><div className="flex items-center gap-2"><img src={assets.icons.fund} alt="" width={20} height={20} /><span className="mono text-[11px] text-[var(--color-text-muted)]">ACTIVE SECTORS</span></div><div className="text-3xl font-bold">—</div><div className="mono text-xs text-[var(--color-text-muted)]">Funding / Closed / Revealed</div><div className="mono text-xs text-[var(--color-text-muted)]">Max 20 shares / grove</div></div>
          <div className="metric-card grid-span-3"><div className="flex items-center gap-2"><img src={assets.illustrations.entropy} alt="" width={20} height={20} className="entropy-spin" /><span className="mono text-[11px] text-[var(--color-text-muted)]">INSTANT MINTS</span></div><div className="text-3xl font-bold">$1.50</div><div className="mono text-xs text-[var(--color-primary)]">1% treasury</div></div>
          <div className="metric-card grid-span-3"><div className="flex items-center gap-2"><img src={assets.illustrations.market} alt="" width={20} height={20} /><span className="mono text-[11px] text-[var(--color-text-muted)]">PROTOCOL</span></div><div className="text-lg font-bold mono">9xmni…Jrnf</div><div className="mono text-xs text-[var(--color-text-muted)]">BP4h…68k · Futarchy</div></div>
        </div>
      </section>

      {/* FEATURE GRID - bento built */}
      <section className="container mt-12">
        <h2 className="heading-lg text-balance text-left">Fund. Reveal. Claim. Govern.</h2>
        <p className="body mt-2 max-w-[560px] text-pretty text-left">Sectors pool mUSDC into PDA vaults. Every deposit mints a Share that later reveals a weight. Weights sum to 1e18 — no zero.</p>
        <div className="dashboard-grid mt-6">
          <div className="card grid-span-8 flex gap-4 items-center text-left"><img src={assets.icons.fund} alt="" width={40} height={40} className="shrink-0" /><div><div className="mono text-xs text-[var(--color-primary)]">01 — Fund</div><h3 className="text-lg font-semibold mt-1">Deposit. Mint sealed.</h3><p className="body mt-1 text-sm text-pretty">mUSDC to PDA vault → Core Share. One tx per Share, 20 max.</p></div><img src={assets.cards.sealed} alt="" width={80} height={120} className="ml-auto hidden sm:block rounded-lg border border-[var(--color-border)]" /></div>
          <div className="card grid-span-4 text-left"><div className="flex items-center gap-2"><img src={assets.icons.reveal} alt="" width={28} height={28} /><span className="mono text-xs text-[var(--color-primary)]">02 — Reveal</span></div><h3 className="mt-3 text-lg font-semibold">Slot-hash → weight</h3><p className="body mt-2 text-sm">Commit slot, wait 10, reveal 0.5–2.0× normalized.</p></div>
          <div className="card grid-span-4 text-left"><div className="flex items-center gap-2"><img src={assets.icons.claim} alt="" width={28} height={28} /><span className="mono text-xs text-[var(--color-primary)]">03 — Claim</span></div><h3 className="mt-3 text-lg font-semibold">Claim pro-rata</h3><p className="body mt-2 text-sm"><span className="mono">weight * total / 1e18</span> — burn delegate.</p></div>
          <div className="card grid-span-8 flex gap-4 items-center text-left"><img src={assets.icons.govern} alt="" width={40} height={40} /><div><div className="mono text-xs text-[var(--color-primary)]">04 — Govern</div><h3 className="text-lg font-semibold mt-1">Futarchy</h3><p className="body mt-1 text-sm">Bonded PASS/FAIL, TWAP decides. Silence = status quo.</p></div><img src={assets.illustrations.market} alt="" width={80} height={80} className="ml-auto hidden sm:block" /></div>
        </div>
      </section>

      {/* LIVE SECTORS TABLE - built */}
      <section className="container mt-12">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <h2 className="heading-lg text-left">Open Sectors</h2>
          <Link href="/sectors" className="mono text-sm text-[var(--color-primary)] no-underline hover:underline">View all sectors →</Link>
        </div>
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead><tr><th>Sector</th><th>Raised</th><th>Goal</th><th>Shares</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {[
                  { name: "AI Infra", raised: "$68", goal: "$100", shares: "2", pct: 68 },
                  { name: "Energy Vault", raised: "$230", goal: "$250", shares: "4", pct: 92 },
                  { name: "Bio Forge", raised: "$23", goal: "$75", shares: "1", pct: 31 },
                ].map((r) => (
                  <tr key={r.name}>
                    <td><div className="flex items-center gap-2"><img src={assets.brand.markGlow} alt="" width={24} height={24} className="rounded-full border border-[var(--color-border)] p-1" /><span className="font-semibold">{r.name}</span></div></td>
                    <td className="mono">{r.raised}<div className="h-1 w-16 bg-[var(--color-border)] rounded-full mt-1"><div className="h-full bg-[var(--color-primary)] rounded-full" style={{ width: `${r.pct}%` }} /></div></td>
                    <td className="mono">{r.goal}</td>
                    <td className="mono">{r.shares}</td>
                    <td><span className="status">Funding</span></td>
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
            <div className="text-left">
              <p className="mono text-xs tracking-[0.16em]">Your first Share starts with one Sector.</p>
              <h2 className="mt-4 max-w-4xl text-4xl font-bold leading-[0.95] tracking-[-0.05em] sm:text-5xl text-balance text-left">Choose the Sector. Set the amount. See what your Share reveals.</h2>
            </div>
            <div className="flex flex-col gap-3 min-[420px]:flex-row lg:flex-col items-stretch">
              <Link href="/sectors" className="inline-flex h-12 min-w-44 items-center justify-center rounded-full bg-black px-5 text-sm font-bold text-white hover:bg-black/90">Explore sectors →</Link>
              <Link href="/instant" className="inline-flex h-12 min-w-44 items-center justify-center rounded-full border border-black/25 bg-transparent px-5 text-sm font-bold text-black hover:bg-black/10">Instant mint</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
