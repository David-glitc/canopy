import Link from "next/link"
import ProgramStatus from "./components/ProgramStatus"
import { assets } from "@/assets"

export default function Home() {
  return (
    <div className="bg-[#050505]">
      {/* HERO - editorial, left-aligned, massive mark */}
      <section className="relative overflow-hidden border-b border-[var(--color-border)]">
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(#1e2e28 1px, transparent 1px), linear-gradient(90deg, #1e2e28 1px, transparent 1px)`, backgroundSize: "80px 80px", opacity: 0.15 }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[600px] bg-gradient-to-br from-[#14f195]/[0.08] via-[#9945FF]/[0.04] to-transparent blur-[80px] rounded-full" />
          <div className="absolute top-20 right-[10%] opacity-[0.04]"><img src={assets.brand.markGlow} alt="" width={400} height={400} /></div>
        </div>
        <div className="container relative grid lg:grid-cols-[1.15fr_0.85fr] gap-12 items-center min-h-[90vh] py-24">
          <div>
            <div className="inline-flex items-center gap-3">
              <span className="h-px w-12 bg-[var(--color-primary)]" />
              <span className="mono text-[11px] font-bold tracking-[0.16em] text-[var(--color-primary)]">CANOPY — SOLANA · DEVNET</span>
              <span className="mono text-[11px] text-[var(--color-text-muted)]">LIVE</span>
            </div>
            <h1 className="mt-6 font-display text-[56px] sm:text-[72px] lg:text-[84px] font-[900] leading-[0.85] tracking-[-0.05em] text-balance">
              Collectible<br />
              <span className="bg-gradient-to-r from-[#14f195] via-[#00FFA3] to-[#9945FF] bg-clip-text text-transparent">claims on</span><br />
              tokenized equity.
            </h1>
            <p className="mt-6 text-[18px] leading-[1.6] text-[var(--color-text-secondary)] max-w-[480px] text-pretty">
              A Sector is a vault. A Share is a key. Fund with mUSDC, reveal your weight, claim pro-rata — <span className="text-white font-medium">or govern by market.</span>
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/instant" className="btn-primary h-[52px] px-8 text-[15px]">Launch app — $1.50 →</Link>
              <Link href="/sectors" className="btn-secondary h-[52px] px-8">View sectors</Link>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-4 max-w-[400px] border-t border-[var(--color-border)] pt-6">
              <div><div className="text-2xl font-bold tabular-nums">20</div><div className="mono text-xs text-[var(--color-text-muted)]">max shares</div></div>
              <div><div className="text-2xl font-bold tabular-nums">$1.50</div><div className="mono text-xs text-[var(--color-primary)]">instant mint</div></div>
              <div><div className="text-2xl font-bold tabular-nums">1e18</div><div className="mono text-xs text-[var(--color-text-muted)]">weight sum</div></div>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="card p-0 overflow-hidden rotate-[-1deg] hover:rotate-0 transition-transform duration-500 shadow-2xl">
              <div className="h-10 flex items-center gap-2 px-4 bg-[#0a0f0e] border-b border-[var(--color-border)]">
                <span className="size-2.5 rounded-full bg-[#ff5c7a]" /><span className="size-2.5 rounded-full bg-[#f5c451]" /><span className="size-2.5 rounded-full bg-[var(--color-primary)]" />
                <span className="mono text-xs text-[var(--color-text-muted)] ml-2">canopy/terminal — Sector #42 · 68% funded</span>
              </div>
              <img src={assets.hero.terminal} alt="" width={480} height={320} className="w-full" />
              <div className="p-3 bg-[#0a0f0e] border-t border-[var(--color-border)] flex gap-2">
                <div className="flex-1 rounded-lg bg-[#050505] border border-[var(--color-border)] p-2.5 flex items-center gap-2"><div className="size-2 rounded-full bg-[var(--color-primary)] animate-pulse" /><span className="mono text-xs font-bold">Backed 1:1 · PDA vault</span></div>
                <div className="flex-1 rounded-lg bg-[var(--color-primary)] p-2.5 flex items-center justify-between"><span className="mono text-xs font-bold text-black">Sealed</span><span className="mono text-xs text-black/60">→ Reveal</span></div>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 card p-3 hidden xl:flex items-center gap-3">
              <img src={assets.illustrations.vault} alt="" width={32} height={32} />
              <div><div className="mono text-xs text-[var(--color-text-muted)]">VAULT TVL</div><div className="text-sm font-bold mono">$12,420.00</div></div>
            </div>
            <div className="absolute -top-4 -right-4 card p-2 flex items-center gap-2">
              <div className="size-8 rounded-full bg-[var(--color-primary-muted)] grid place-items-center"><span className="mono text-xs font-bold text-[var(--color-primary)]">S</span></div>
              <div><div className="mono text-[10px] text-[var(--color-text-muted)]">ENTROPY</div><div className="mono text-xs font-bold">Slot 739M</div></div>
            </div>
          </div>
        </div>
      </section>
      {/* MARQUEE - live activity */}
      <div className="border-y border-[var(--color-border)] bg-[#0a0f0e] overflow-hidden py-3">
        <div className="flex gap-8 animate-activity-scroll whitespace-nowrap">
          {["Share #42 minted · $5.00","Sector AI Infra → 68%","Instant #128 revealed · Epic","Vault $230 / $250","Slot-hash 739,421,008"].map(t => (
            <span key={t} className="mono text-xs text-[var(--color-text-muted)] flex items-center gap-2"><span className="size-1.5 rounded-full bg-[var(--color-primary)]" />{t}</span>
          ))}
        </div>
      </div>
      {/* BENTO - built */}
      <section className="container mt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card md:col-span-2 min-h-[200px] flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--color-primary)] opacity-[0.04] blur-[30px] rounded-full" />
            <div><div className="mono text-xs text-[var(--color-primary)]">01 — Fund</div><h3 className="text-xl font-bold mt-2">Deposit. Mint sealed.</h3><p className="body mt-2 text-sm max-w-[320px]">mUSDC to PDA vault → Core Share. One tx per Share, 20 max. PDA ATA vault, Token-2022.</p></div>
            <img src={assets.cards.sealed} alt="" width={90} height={135} className="absolute right-4 bottom-4 hidden sm:block rounded-lg border border-[var(--color-border)] rotate-[-2deg]" />
          </div>
          <div className="card flex flex-col justify-between">
            <div><div className="mono text-xs text-[var(--color-primary)]">02 — Reveal</div><h3 className="font-bold mt-2">Slot-hash → weight</h3></div>
            <img src={assets.illustrations.entropy} alt="" width={56} height={56} className="entropy-spin opacity-60" />
            <p className="mono text-xs text-[var(--color-text-muted)]">commit + 10 slots → 0.5–2.0×</p>
          </div>
          <div className="card">
            <div className="mono text-xs text-[var(--color-primary)]">03 — Claim</div><h3 className="font-bold mt-2">Claim pro-rata</h3><div className="mt-3 rounded-lg bg-[#080909] border border-[var(--color-border)] p-3 mono text-xs"><div className="text-[var(--color-text-muted)]">weight * total / 1e18</div><div className="font-bold text-[var(--color-primary)]">burn delegate</div></div>
          </div>
          <div className="card md:col-span-2 flex gap-4 items-center">
            <div className="size-12 rounded-xl bg-[#9945FF]/10 border border-[#9945FF]/20 grid place-items-center shrink-0"><img src={assets.icons.govern} alt="" width={24} height={24} /></div>
            <div><div className="mono text-xs text-[#9945FF]">04 — Govern</div><h3 className="font-bold mt-1">Futarchy</h3><p className="mono text-xs text-[var(--color-text-muted)]">Bonded PASS/FAIL · TWAP decides</p></div>
            <img src={assets.illustrations.market} alt="" width={64} height={64} className="ml-auto hidden sm:block" />
          </div>
        </div>
      </section>
      <section className="container mt-12">
        <ProgramStatus />
      </section>
    </div>
  )
}
