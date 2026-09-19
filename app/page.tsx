import Link from "next/link"
import ProgramStatus from "./components/ProgramStatus"
import { assets } from "@/assets"

export default function Home() {
  return (
    <div className="bg-[#050505]">
      {/* HERO — editorial, asymmetric, built */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: `linear-gradient(#1e2e28 1px, transparent 1px), linear-gradient(90deg, #1e2e28 1px, transparent 1px)`, backgroundSize: "64px 64px" }} />
          <div className="absolute top-0 right-0 w-[720px] h-[480px] bg-gradient-to-br from-[#14f195]/[0.07] via-[#9945FF]/[0.05] to-transparent blur-[60px] rounded-full" />
          <div className="absolute left-0 bottom-0 w-[520px] h-[320px] bg-gradient-to-tr from-[#14f195]/[0.04] to-transparent blur-[40px]" />
        </div>
        <div className="container relative grid lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-12 items-start pt-24 pb-16 lg:pt-32 lg:pb-20">
          <div className="max-w-[560px]">
            <div className="inline-flex items-center gap-2">
              <span className="h-px w-8 bg-[var(--color-primary)]" />
              <span className="mono text-[11px] font-semibold tracking-[0.16em] text-[var(--color-primary)]">CANOPY — SOLANA DEVNET</span>
            </div>
            <h1 className="mt-6 font-display text-[48px] sm:text-[64px] lg:text-[72px] font-[800] leading-[0.88] tracking-[-0.04em] text-balance">
              Collectible<br />
              <span className="bg-gradient-to-r from-[#14f195] to-[#00FFA3] bg-clip-text text-transparent">claims on</span><br />
              tokenized equity.
            </h1>
            <p className="mt-6 text-[18px] leading-[1.6] text-[var(--color-text-secondary)] text-pretty max-w-[460px]">
              A Sector is a vault. A Share is a key. Fund with mUSDC, reveal your weight, claim pro-rata — or govern by market.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/instant" className="btn-primary h-[48px] px-7 text-[14px]">Launch app <span className="ml-1">→</span></Link>
              <Link href="/sectors" className="btn-secondary h-[48px] px-7">Explore sectors</Link>
            </div>
            <div className="mt-8 flex items-center gap-3 mono text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-primary)]/20 bg-[var(--color-primary-muted)] px-3 py-1.5"><span className="size-2 rounded-full bg-[var(--color-primary)] animate-pulse" /> Live</span>
              <span className="text-[var(--color-text-muted)]">9xmni…Jrnf · PDA vaults · Core Shares</span>
            </div>
          </div>
          <div className="relative lg:h-[560px]">
            <div className="card p-0 overflow-hidden rotate-[-0.5deg] hover:rotate-0 transition-transform duration-300">
              <div className="h-10 flex items-center gap-2 px-4 border-b border-[var(--color-border)] bg-[#0a0f0e]">
                <span className="size-2.5 rounded-full bg-[#ff5c7a]" /><span className="size-2.5 rounded-full bg-[#f5c451]" /><span className="size-2.5 rounded-full bg-[var(--color-primary)]" />
                <span className="mono text-[11px] text-[var(--color-text-muted)] ml-2">canopy/terminal — 3 shares · 68% funded</span>
                <span className="ml-auto status text-[10px]">Funding</span>
              </div>
              <img src={assets.hero.terminal} alt="" width={480} height={320} className="w-full h-auto" />
              <div className="p-4 bg-[#0a0f0e] border-t border-[var(--color-border)] grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-[#050505] border border-[var(--color-border)] p-3"><div className="mono text-[10px] text-[var(--color-text-muted)]">VAULT</div><div className="mono text-xs font-bold mt-1">$230 / $250</div><div className="h-1 bg-[var(--color-border)] rounded-full mt-2"><div className="h-full w-[92%] bg-[var(--color-primary)] rounded-full" /></div></div>
                <div className="rounded-xl bg-[#050505] border border-[var(--color-border)] p-3"><div className="mono text-[10px] text-[var(--color-text-muted)]">SHARES</div><div className="text-lg font-bold">4</div><div className="mono text-xs text-[var(--color-text-muted)]">2 more for reveal</div></div>
                <div className="rounded-xl bg-[var(--color-primary)] p-3 text-black"><div className="mono text-[10px] opacity-70">ACTION</div><div className="text-xs font-bold mt-1">Fund sector →</div></div>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-2 lg:-right-6 card p-3 flex items-center gap-3 shadow-xl">
              <div className="size-10 rounded-full bg-[var(--color-primary-muted)] border border-[var(--color-primary)]/20 grid place-items-center"><img src={assets.icons.fund} alt="" width={20} height={20} /></div>
              <div><div className="mono text-xs text-[var(--color-text-muted)]">LAST MINT</div><div className="text-sm font-bold mono">Share #3 · $42.00</div></div>
              <div className="hidden sm:flex items-center gap-1 ml-2 mono text-xs text-[var(--color-primary)]">+2.4% ↗</div>
            </div>
            <div className="absolute -top-2 -left-2 hidden lg:flex card p-2 items-center gap-2">
              <img src={assets.illustrations.entropy} alt="" width={28} height={28} className="entropy-spin" />
              <div><div className="mono text-[10px] text-[var(--color-text-muted)]">ENTROPY</div><div className="mono text-xs font-bold">Slot 739,421,008</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP - not generic */}
      <section className="border-y border-[var(--color-border)] bg-[#0a0f0e]/50">
        <div className="container flex flex-wrap items-center justify-between gap-4 py-4">
          <span className="mono text-xs text-[var(--color-text-muted)]">Powered by</span>
          <div className="flex items-center gap-6 mono text-xs font-semibold">
            <span className="inline-flex items-center gap-1.5"><img src={assets.icons.solana} alt="" width={16} height={16} /> Solana</span>
            <span className="text-[var(--color-border)]">·</span>
            <span>Metaplex Core</span>
            <span className="text-[var(--color-border)]">·</span>
            <span>Jupiter</span>
            <span className="text-[var(--color-border)]">·</span>
            <span>Pyth</span>
          </div>
          <span className="mono text-xs text-[var(--color-text-muted)]">Devnet · mock mUSDC</span>
        </div>
      </section>

      {/* MARKET OVERVIEW - bento built, not 4 equal */}
      <section className="container mt-12">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-[22px] font-bold tracking-[-0.02em]">Market overview</h2>
          <span className="mono text-xs text-[var(--color-text-muted)]">devnet • updated just now</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card md:col-span-2 flex flex-col justify-between min-h-[180px] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary)] opacity-[0.06] blur-[30px] rounded-full" />
            <div><div className="mono text-xs text-[var(--color-text-muted)]">TOTAL DEPOSITED</div><div className="text-3xl font-bold tracking-[-0.02em] mt-2">$— <span className="text-sm font-normal text-[var(--color-text-muted)]">across Sectors</span></div></div>
            <div className="h-12 w-full mt-4"><svg viewBox="0 0 300 48" className="w-full h-full"><path d="M0 32 L40 28 L80 30 L120 18 L160 22 L200 12 L240 16 L300 4" className="chart-line" fill="none"/><path d="M0 32 L40 28 L80 30 L120 18 L160 22 L200 12 L240 16 L300 4 L300 48 L0 48 Z" className="chart-area"/></svg></div>
          </div>
          <div className="card flex flex-col justify-between">
            <div className="mono text-xs text-[var(--color-text-muted)]">ACTIVE SECTORS</div>
            <div className="text-3xl font-bold">—</div>
            <div className="flex gap-1.5 mt-2"><span className="status text-[10px]">Funding</span><span className="status-warning status text-[10px]">Closed</span></div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between"><span className="mono text-xs text-[var(--color-text-muted)]">INSTANT</span><span className="mono text-xs text-[var(--color-primary)]">1% fee</span></div>
            <div className="text-2xl font-bold mt-2">$1.50</div>
            <div className="mono text-xs text-[var(--color-text-muted)]">solo vault · instant reveal</div>
            <div className="mt-3 h-1 bg-[var(--color-border)] rounded-full overflow-hidden"><div className="h-full w-full bg-[var(--color-primary)]" /></div>
          </div>
          <div className="card md:col-span-2">
            <div className="flex items-center justify-between"><span className="mono text-xs text-[var(--color-text-muted)]">PROTOCOL</span><span className="status">Live</span></div>
            <div className="mono text-sm font-bold mt-2">9xmni…Jrnf</div>
            <div className="mono text-xs text-[var(--color-text-muted)]">canopy · 454k</div>
            <div className="mono text-xs text-[var(--color-text-muted)]">BP4h…68k · futarchy · 257k</div>
          </div>
          <div className="card flex items-center gap-3">
            <img src={assets.illustrations.market} alt="" width={32} height={32} />
            <div><div className="mono text-xs text-[var(--color-text-muted)]">EXECUTION</div><div className="text-sm font-bold">Jupiter + Pyth</div></div>
          </div>
        </div>
      </section>

      {/* FEATURE GRID - editorial bento, not 4 equal */}
      <section className="container mt-12">
        <div className="max-w-[640px]">
          <h2 className="text-[32px] font-bold tracking-[-0.02em] leading-[0.95]">Fund. Reveal.<br />Claim. Govern.</h2>
          <p className="body mt-3 text-pretty">Sectors pool mUSDC into PDA vaults. Every deposit mints a Share that later reveals a weight. Weights sum to 1e18 — no zero.</p>
        </div>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[180px]">
          <div className="card md:col-span-2 row-span-1 flex gap-4 items-center">
            <div className="size-12 rounded-xl bg-[var(--color-primary-muted)] border border-[var(--color-primary)]/20 grid place-items-center shrink-0"><img src={assets.icons.fund} alt="" width={24} height={24} /></div>
            <div className="flex-1"><div className="mono text-xs text-[var(--color-primary)]">01 — Fund</div><h3 className="font-semibold mt-1">Deposit. Mint sealed.</h3><p className="mono text-xs text-[var(--color-text-muted)] mt-1">mUSDC → PDA vault → Core Share · 20 max</p></div>
            <img src={assets.cards.sealed} alt="" width={70} height={105} className="hidden sm:block rounded-lg border border-[var(--color-border)]" />
          </div>
          <div className="card flex flex-col justify-between">
            <div><div className="mono text-xs text-[var(--color-primary)]">02 — Reveal</div><h3 className="font-semibold mt-2">Slot-hash → weight</h3></div>
            <img src={assets.illustrations.entropy} alt="" width={48} height={48} className="entropy-spin opacity-60" />
            <p className="mono text-xs text-[var(--color-text-muted)]">commit + 10 slots → 0.5–2.0×</p>
          </div>
          <div className="card flex flex-col justify-between">
            <div><div className="mono text-xs text-[var(--color-primary)]">03 — Claim</div><h3 className="font-semibold mt-2">Claim pro-rata</h3></div>
            <div className="rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] p-3 mono text-xs"><div className="text-[var(--color-text-muted)]">weight * total / 1e18</div><div className="font-bold">burn delegate</div></div>
          </div>
          <div className="card md:col-span-2 flex gap-4 items-center">
            <div className="size-12 rounded-xl bg-[#9945FF]/10 border border-[#9945FF]/20 grid place-items-center shrink-0"><img src={assets.icons.govern} alt="" width={24} height={24} /></div>
            <div><div className="mono text-xs text-[#9945FF]">04 — Govern</div><h3 className="font-semibold mt-1">Futarchy</h3><p className="mono text-xs text-[var(--color-text-muted)] mt-1">Bonded PASS/FAIL · TWAP decides · Silence = status quo</p></div>
            <img src={assets.illustrations.market} alt="" width={64} height={64} className="ml-auto hidden sm:block" />
          </div>
        </div>
      </section>

      {/* LIVE TABLE - built */}
      <section className="container mt-12">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-[22px] font-bold">Open Sectors</h2>
          <Link href="/sectors" className="mono text-sm text-[var(--color-primary)] hover:underline">View all sectors →</Link>
        </div>
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead><tr><th>Sector</th><th>Raised</th><th>Goal</th><th>Shares</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {[
                  { name: "AI Infra", raised: "$68", goal: "$100", shares: "2", pct: 68 },
                  { name: "Energy Vault", raised: "$230", goal: "$250", shares: "4", pct: 92 },
                  { name: "Bio Forge", raised: "$23", goal: "$75", shares: "1", pct: 31 },
                ].map((r) => (
                  <tr key={r.name}>
                    <td><div className="flex items-center gap-3"><img src={assets.brand.markGlow} alt="" width={28} height={28} className="rounded-full bg-[#0a0f0e] border border-[var(--color-border)] p-1" /><div><div className="font-semibold text-sm">{r.name}</div><div className="mono text-xs text-[var(--color-text-muted)]">PDA vault · Core</div></div></div></td>
                    <td><div className="mono text-sm font-medium">{r.raised}</div><div className="h-1 w-20 bg-[var(--color-border)] rounded-full mt-1.5"><div className="h-full bg-[var(--color-primary)] rounded-full" style={{ width: `${r.pct}%` }} /></div></td>
                    <td className="mono text-sm">{r.goal}</td>
                    <td className="mono text-sm">{r.shares}</td>
                    <td><span className="status">Funding</span></td>
                    <td><Link href="/sectors" className="btn-compact btn-secondary">Fund</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between p-3 bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)] mono text-xs">
            <span className="text-[var(--color-text-muted)]">Mock mUSDC on devnet</span>
            <span className="text-[var(--color-primary)]">Create a Sector →</span>
          </div>
        </div>
      </section>

      {/* AFTER REVEAL - built */}
      <section className="container mt-12">
        <div className="grid lg:grid-cols-[380px_1fr] gap-6">
          <div className="card p-6 lg:sticky lg:top-[88px] h-fit">
            <div className="aspect-[2/3] rounded-xl border border-[var(--color-border)] bg-[#080909] grid place-items-center relative overflow-hidden">
              <img src={assets.cards.revealed} alt="" width={160} height={240} className="card-idle-float" />
              <div className="absolute bottom-3 left-3 status">REVEALED · 6.42%</div>
              <div className="absolute top-3 right-3 rounded-full bg-[var(--color-primary)] text-black px-2 py-1 text-[10px] font-bold">Epic</div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] p-2 text-center"><div className="mono text-[10px] text-[var(--color-text-muted)]">TYPE</div><div className="mono text-xs font-bold">Share</div></div>
              <div className="rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] p-2 text-center"><div className="mono text-[10px] text-[var(--color-text-muted)]">BACKING</div><div className="mono text-xs font-bold">mUSDC</div></div>
              <div className="rounded-lg bg-[var(--color-primary-muted)] border border-[var(--color-primary)]/20 p-2 text-center"><div className="mono text-[10px] text-[var(--color-text-muted)]">RARITY</div><div className="mono text-xs font-bold text-[var(--color-primary)]">Epic</div></div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="card"><p className="mono text-xs tracking-[0.16em] text-[var(--color-primary)]">Known ownership</p><p className="mt-3 text-4xl font-bold tracking-[-0.05em] tabular-nums">6.42%</p><p className="body mt-2 text-sm">Exact % used when you claim. No surprises after reveal.</p></div>
            <div className="card"><p className="mono text-xs tracking-[0.16em] text-[var(--color-primary)]">Several stocks</p><div className="mt-4 flex gap-2"><span className="size-10 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] grid place-items-center mono text-xs">NVDA</span><span className="size-10 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] grid place-items-center mono text-xs">AAPL</span><span className="size-10 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] grid place-items-center mono text-xs">TSLA</span><span className="size-10 rounded-full bg-[var(--color-primary)] text-black grid place-items-center mono text-xs font-bold">+2</span></div><p className="body mt-3 text-sm">One claim sends your share of every token in the vault.</p></div>
            <div className="card">
              <div className="flex items-center justify-between"><h3 className="font-semibold">Claim preview</h3><span className="rounded-full bg-[var(--color-primary)] text-black mono text-xs px-2 py-1 font-bold">Epic</span></div>
              <div className="mt-4 grid grid-cols-3 gap-3">{[["NVDA","0.0328"],["AAPL","0.1184"],["TSLA","0.0712"]].map(([s,a]) => (<div key={s} className="rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] p-3"><div className="mono text-xs text-[var(--color-text-muted)]">{s}</div><div className="mono text-sm font-bold tabular-nums mt-1">{a}</div><div className="mono text-[10px] text-[var(--color-text-muted)]">tokens</div></div>))}</div>
              <div className="mt-4 flex gap-2"><Link href="/sectors" className="btn-primary flex-1">Claim share</Link><Link href="/shop" className="btn-secondary flex-1">Trade on shop</Link></div>
            </div>
            <div className="card bg-[var(--color-bg-secondary)]"><ProgramStatus /></div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mt-12 mb-12">
        <div className="relative overflow-hidden rounded-2xl border border-[var(--color-primary)]/20 bg-gradient-to-br from-[var(--color-primary)] via-[#14f195] to-[#00d084] p-8 sm:p-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[40px] rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative grid lg:grid-cols-[1fr_auto] gap-6 items-center">
            <div>
              <p className="mono text-xs tracking-[0.16em] text-black/60">START HERE</p>
              <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-[-0.02em] text-black text-balance">Choose the Sector.<br />See what your Share reveals.</h2>
              <p className="mono text-sm text-black/60 mt-2">Devnet · faucet 10 mUSDC · no real funds</p>
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/sectors" className="inline-flex h-12 min-w-[200px] items-center justify-center rounded-full bg-black px-6 text-sm font-bold text-white hover:bg-black/90">Explore sectors →</Link>
              <Link href="/instant" className="inline-flex h-12 min-w-[200px] items-center justify-center rounded-full bg-white px-6 text-sm font-bold text-black hover:bg-white/90">Instant mint — $1.50</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
