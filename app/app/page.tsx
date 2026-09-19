import Link from "next/link"
import ProgramStatus from "./components/ProgramStatus"
import { assets } from "@/assets"

export default function Home() {
  return (
    <div className="bg-[#050505]">
      {/* HERO - editorial, massive, ingenious */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(#1e2e28 1px, transparent 1px), linear-gradient(90deg, #1e2e28 1px, transparent 1px)`, backgroundSize: "80px 80px" }} />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1400px] h-[800px] bg-gradient-to-b from-[#14f195]/[0.06] via-[#14f195]/[0.02] to-transparent blur-[60px] rounded-full" />
          <div className="absolute top-20 right-[8%] w-[320px] h-[320px] opacity-[0.03]"><img src={assets.brand.markGlow} alt="" width={320} height={320} /></div>
        </div>
        <div className="container relative grid lg:grid-cols-[1.15fr_0.85fr] gap-8 lg:gap-16 items-start pt-28 pb-16 lg:pt-36 lg:pb-24">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-12 bg-[var(--color-primary)]" />
              <span className="mono text-[11px] font-bold tracking-[0.16em] text-[var(--color-primary)]">CANOPY</span>
              <span className="mono text-[11px] text-[var(--color-text-muted)]">— SOLANA DEVNET</span>
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-[var(--color-primary)] px-2 py-1 mono text-[10px] font-bold text-black">LIVE</span>
            </div>
            <h1 className="mt-6 font-display text-[52px] sm:text-[68px] lg:text-[84px] font-[900] leading-[0.84] tracking-[-0.05em] text-balance">
              Collectible<br />
              <span className="bg-gradient-to-r from-[#14f195] via-[#00FFA3] to-[#9945FF] bg-clip-text text-transparent">claims on</span><br />
              <span className="text-white">tokenized equity.</span>
            </h1>
            <p className="mt-6 text-[18px] leading-[1.6] text-[var(--color-text-secondary)] max-w-[480px] text-pretty">
              A Sector is a <span className="text-white font-medium">PDA vault</span>. A Share is a <span className="text-white font-medium">Core key</span>. Fund, reveal, claim — or govern by market.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/instant" className="btn-primary h-[52px] px-8 text-[15px] shadow-[0_0_24px_rgba(20,241,149,0.18)]">Launch app — $1.50 →</Link>
              <Link href="/sectors" className="btn-secondary h-[52px] px-8">Explore sectors</Link>
            </div>
            <div className="mt-8 flex items-center gap-4">
              <div className="flex -space-x-2">
                <img src={assets.brand.markGlow} alt="" width={28} height={28} className="rounded-full border-2 border-[#050505] bg-[#0a0f0e] p-1" />
                <div className="size-7 rounded-full bg-[var(--color-primary)] border-2 border-[#050505] grid place-items-center mono text-[10px] font-bold text-black">20</div>
                <div className="size-7 rounded-full bg-[#9945FF] border-2 border-[#050505] grid place-items-center mono text-[10px] font-bold text-white">1e18</div>
              </div>
              <span className="mono text-xs text-[var(--color-text-muted)]">20 max shares · 1e18 weight · slot-hash</span>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="card p-0 overflow-hidden rotate-[-0.7deg] hover:rotate-0 transition-transform duration-500 shadow-2xl">
              <div className="h-10 flex items-center gap-2 px-4 bg-[#0a0f0e] border-b border-[var(--color-border)]">
                <span className="size-2.5 rounded-full bg-[#ff5c7a]" /><span className="size-2.5 rounded-full bg-[#f5c451]" /><span className="size-2.5 rounded-full bg-[var(--color-primary)]" />
                <span className="mono text-xs text-[var(--color-text-muted)] ml-2">canopy/terminal — 4 shares · 92% funded</span>
                <span className="ml-auto status text-[10px]">Funding</span>
              </div>
              <img src={assets.hero.terminal} alt="" width={480} height={320} className="w-full" />
              <div className="p-3 bg-[#0a0f0e] border-t border-[var(--color-border)] grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-[#050505] border border-[var(--color-border)] p-2.5"><div className="mono text-[10px] text-[var(--color-text-muted)]">RAISED</div><div className="mono text-xs font-bold mt-1">$230 / $250</div><div className="h-1 bg-[var(--color-border)] rounded-full mt-1.5"><div className="h-full w-[92%] bg-[var(--color-primary)] rounded-full" /></div></div>
                <div className="rounded-xl bg-[#050505] border border-[var(--color-border)] p-2.5 text-center"><div className="mono text-[10px] text-[var(--color-text-muted)]">SHARES</div><div className="text-lg font-bold">4</div><div className="mono text-xs text-[var(--color-text-muted)]">+16 for reveal</div></div>
                <div className="rounded-xl bg-[var(--color-primary)] p-2.5 text-black text-center"><div className="mono text-[10px] opacity-70">ACTION</div><div className="text-xs font-bold mt-1">Fund →</div></div>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-2 card p-3 flex items-center gap-3 shadow-xl">
              <div className="size-10 rounded-xl bg-[var(--color-primary-muted)] border border-[var(--color-primary)]/20 grid place-items-center"><img src={assets.icons.fund} alt="" width={20} height={20} /></div>
              <div><div className="mono text-xs text-[var(--color-text-muted)]">LAST MINT</div><div className="text-sm font-bold mono">Share #4 · $60.00</div></div>
              <span className="mono text-xs text-[var(--color-primary)] ml-2">↗ +2.4%</span>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST - built, not generic */}
      <section className="border-y border-[var(--color-border)] bg-[#0a0f0e]">
        <div className="container flex flex-wrap items-center justify-between gap-4 py-3">
          <span className="mono text-xs text-[var(--color-text-muted)]">Built on</span>
          <div className="flex items-center gap-6 mono text-xs font-semibold">
            <span className="inline-flex items-center gap-1.5"><img src={assets.icons.solana} alt="" width={16} height={16} /> Solana</span>
            <span className="size-1 rounded-full bg-[var(--color-border)]" />
            <span>Metaplex Core</span>
            <span className="size-1 rounded-full bg-[var(--color-border)]" />
            <span>Jupiter</span>
            <span className="size-1 rounded-full bg-[var(--color-border)]" />
            <span>Pyth</span>
          </div>
          <span className="mono text-xs px-2 py-1 rounded-full bg-[var(--color-primary-muted)] border border-[var(--color-primary)]/20 text-[var(--color-primary)]">Devnet · mock mUSDC</span>
        </div>
      </section>

      {/* BENTO - editorial, built */}
      <section className="container mt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card md:col-span-2 min-h-[220px] flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--color-primary)] opacity-[0.04] blur-[40px] rounded-full group-hover:opacity-[0.08] transition-opacity" />
            <div><div className="inline-flex items-center gap-2 mono text-xs text-[var(--color-primary)]"><img src={assets.icons.fund} alt="" width={16} height={16} /> 01 — Fund</div><h3 className="text-[22px] font-bold mt-2 leading-tight">Deposit. Mint sealed.</h3><p className="body mt-2 text-sm max-w-[360px]">mUSDC to PDA vault → Core Share. One tx per Share, 20 max. PDA ATA vault, Token-2022.</p></div>
            <img src={assets.cards.sealed} alt="" width={96} height={144} className="absolute right-4 bottom-4 hidden sm:block rounded-xl border border-[var(--color-border)] rotate-[-1deg] group-hover:rotate-0 transition-transform duration-300 shadow-lg" />
          </div>
          <div className="card flex flex-col justify-between relative overflow-hidden">
            <div><div className="mono text-xs text-[var(--color-primary)]">02 — Reveal</div><h3 className="font-bold mt-2">Slot-hash → weight</h3></div>
            <div className="size-16 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] grid place-items-center mt-4"><img src={assets.illustrations.entropy} alt="" width={32} height={32} className="entropy-spin opacity-80" /></div>
            <p className="mono text-xs text-[var(--color-text-muted)] mt-3">commit + 10 slots → 0.5–2.0×</p>
          </div>
          <div className="card flex flex-col justify-between">
            <div><div className="mono text-xs text-[var(--color-primary)]">03 — Claim</div><h3 className="font-bold mt-2">Claim pro-rata</h3></div>
            <div className="mt-4 rounded-xl bg-[#080909] border border-[var(--color-border)] p-3"><div className="mono text-xs text-[var(--color-text-muted)]">weight * total / 1e18</div><div className="mono text-sm font-bold text-[var(--color-primary)] mt-1">burn delegate</div></div>
            <p className="mono text-xs text-[var(--color-text-muted)] mt-3">No custody. PDA vault pays.</p>
          </div>
          <div className="card md:col-span-2 flex gap-4 items-center">
            <div className="size-14 rounded-xl bg-[#9945FF]/10 border border-[#9945FF]/20 grid place-items-center shrink-0"><img src={assets.icons.govern} alt="" width={28} height={28} /></div>
            <div className="flex-1"><div className="mono text-xs text-[#9945FF]">04 — Govern</div><h3 className="font-bold mt-1">Futarchy</h3><p className="mono text-xs text-[var(--color-text-muted)] mt-1">Bonded PASS/FAIL · TWAP decides · Silence = status quo</p></div>
            <img src={assets.illustrations.market} alt="" width={72} height={72} className="hidden sm:block" />
          </div>
        </div>
      </section>

      {/* TABLE - built */}
      <section className="container mt-12">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-[22px] font-bold tracking-[-0.02em]">Open Sectors</h2>
          <span className="mono text-xs px-2 py-1 rounded-full bg-[var(--color-primary-muted)] text-[var(--color-primary)]">3 funding</span>
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
            <span className="text-[var(--color-text-muted)]">3 open · 12 total · devnet</span>
            <Link href="/sectors" className="text-[var(--color-primary)] hover:underline">View all sectors →</Link>
          </div>
        </div>
      </section>

      <section className="container mt-12">
        <ProgramStatus />
      </section>

      <section className="container mt-12 mb-12">
        <div className="relative overflow-hidden rounded-2xl border border-[var(--color-primary)]/20 bg-gradient-to-br from-[var(--color-primary)] via-[#14f195] to-[#00d084] p-8 sm:p-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[40px] rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative grid lg:grid-cols-[1fr_auto] gap-6 items-center">
            <div>
              <p className="mono text-xs tracking-[0.16em] text-black/60">START HERE — DEVNET FAUCET 10 mUSDC</p>
              <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-[-0.02em] text-black text-balance">Choose the Sector.<br />See what your Share reveals.</h2>
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
