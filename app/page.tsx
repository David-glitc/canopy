"use client";
import Link from "next/link"
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import ProgramStatus from "./components/ProgramStatus"
import { assets } from "@/assets"

export default function Home() {
  const reduce = useReducedMotion()
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
  const y = useTransform(scrollYProgress, [0, 1], [0, 120])
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  return (
    <div>
      {/* HERO — cinematic, stunning, filled */}
      <section ref={heroRef} className="relative isolate overflow-hidden bg-[#050505]">
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-[0.45]" style={{ backgroundImage: `radial-gradient(ellipse 900px 600px at 50% -10%, rgba(20,241,149,0.16), transparent 60%), radial-gradient(ellipse 700px 500px at 90% 20%, rgba(153,69,255,0.14), transparent 60%), linear-gradient(to right, #1e2e28 1px, transparent 1px), linear-gradient(to bottom, #1e2e28 1px, transparent 1px)`, backgroundSize: "auto, auto, 64px 64px, 64px 64px" }} />
          <motion.div style={{ y: reduce ? 0 : y }} className="absolute left-1/2 top-[12%] -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-br from-[#14f195]/[0.09] via-[#9945FF]/[0.06] to-transparent blur-[80px] rounded-full" />
        </div>

        <div className="container relative grid lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-12 items-center min-h-[88vh] py-24 lg:py-12" style={{ paddingTop: "88px" }}>
          <motion.div initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-primary)]/20 bg-[var(--color-primary-muted)] px-3 py-1.5">
              <span className="size-2 rounded-full bg-[var(--color-primary)] live-indicator" />
              <span className="mono text-[11px] font-semibold tracking-[0.08em] text-[var(--color-primary)]">LIVE ON DEVNET</span>
              <span className="mono text-[11px] text-[var(--color-text-muted)]">· Solana · devnet</span>
            </div>
            <h1 className="heading-xl mt-6 text-balance">
              Collectible<br />
              <span className="bg-gradient-to-r from-[#14f195] via-[#14f195] to-[#9945FF] bg-clip-text text-transparent">claims on</span><br />
              tokenized equity.
            </h1>
            <p className="body mt-5 max-w-[480px] text-pretty text-[18px] leading-[1.6]">
              Fund a Sector. Mint a sealed <span className="text-white font-medium">Core Share</span>. Reveal how much of the vault you own — then govern it by market.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/instant" className="btn-primary px-7">Launch app</Link>
              <Link href="/sectors" className="btn-secondary px-7">Explore sectors</Link>
            </div>
            <div className="mt-6 flex items-center gap-4 mono text-xs text-[var(--color-text-muted)]">
              <span className="inline-flex items-center gap-1.5"><img src={assets.icons.solana} alt="" width={16} height={16} />Solana</span>
              <span>·</span>
              <span>mock mUSDC</span>
              <span>·</span>
              <span>slot-hash entropy</span>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-3 max-w-[420px]">
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"><div className="mono text-[10px] text-[var(--color-text-muted)]">INSTANT</div><div className="text-xl font-bold tabular-nums">$1.50</div><div className="mono text-xs text-[var(--color-primary)]">1% fee → treasury</div></div>
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"><div className="mono text-[10px] text-[var(--color-text-muted)]">MAX</div><div className="text-xl font-bold tabular-nums">20</div><div className="mono text-xs text-[var(--color-text-muted)]">shares / grove</div></div>
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"><div className="mono text-[10px] text-[var(--color-text-muted)]">ENTROPY</div><div className="text-xl font-bold">Slot</div><div className="mono text-xs text-[var(--color-primary)]">hash</div></div>
            </div>
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            style={{ opacity: reduce ? 1 : opacity }}
            className="relative lg:h-[520px] hidden lg:block"
          >
            <div className="absolute inset-0 card p-0 overflow-hidden hero-float">
              <div className="h-9 flex items-center gap-2 px-4 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                <span className="size-3 rounded-full bg-[#ff5c7a]" /><span className="size-3 rounded-full bg-[#f5c451]" /><span className="size-3 rounded-full bg-[var(--color-primary)]" />
                <span className="mono text-xs text-[var(--color-text-muted)] ml-2">canopy — devnet • PDA vault • Core Shares</span>
                <span className="ml-auto status text-[10px]">Sealed</span>
              </div>
              <img src={assets.hero.terminal} alt="Terminal" width={480} height={320} className="w-full h-auto" />
              <div className="grid grid-cols-3 gap-2 p-4 bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)]">
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3 text-center"><div className="mono text-[10px] text-[var(--color-text-muted)]">TYPE</div><div className="text-xs font-bold mt-1">Core Share</div></div>
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3 text-center"><div className="mono text-[10px] text-[var(--color-text-muted)]">BACKING</div><div className="text-xs font-bold mt-1">mUSDC</div></div>
                <div className="rounded-xl border border-[var(--color-primary)]/30 bg-[var(--color-primary-muted)] p-3 text-center"><div className="mono text-[10px] text-[var(--color-text-muted)]">STATUS</div><div className="text-xs font-bold text-[var(--color-primary)]">Reveal →</div></div>
              </div>
            </div>
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="absolute -bottom-2 -right-2 card p-3 flex items-center gap-3 shadow-xl vault-pulse hidden xl:flex"
            >
              <img src={assets.illustrations.vault} alt="" width={36} height={36} />
              <div><div className="mono text-xs text-[var(--color-text-muted)]">VAULT</div><div className="text-sm font-bold">Backed 1:1 · PDA</div></div>
              <div className="h-8 w-px bg-[var(--color-border)] mx-1" />
              <img src={assets.illustrations.entropy} alt="" width={36} height={36} className="entropy-spin" />
              <div><div className="mono text-xs text-[var(--color-text-muted)]">ENTROPY</div><div className="text-sm font-bold text-[var(--color-primary)]">Slot-hash</div></div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* MARKET OVERVIEW - built metric with sparklines */}
      <section className="container">
        <div className="flex items-end justify-between mb-6">
          <h2 className="heading-lg text-balance">Market overview</h2>
          <span className="status live-indicator">Live • devnet</span>
        </div>
        <div className="dashboard-grid">
          {[
            { k: "TOTAL DEPOSITED", v: "$—", sub: "Across all Sectors", accent: "↗ devnet", icon: assets.illustrations.vault, spark: "M0 18 L20 14 L40 16 L60 8 L80 12 L100 4" },
            { k: "ACTIVE SECTORS", v: "—", sub: "Max 20 shares / grove", accent: "Funding / Closed / Revealed", icon: assets.icons.fund, spark: null },
            { k: "INSTANT MINTS", v: "$1.50", sub: "Solo vaults, instant reveal", accent: "1% treasury", icon: assets.illustrations.entropy, spark: null },
            { k: "PROTOCOL", v: "Devnet", sub: "Jupiter + Pyth ready", accent: "9xmni…Jrnf · BP4h…68k", icon: assets.illustrations.market, spark: null },
          ].map((m, i) => (
            <motion.div
              key={m.k}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
              className="metric-card grid-span-3"
            >
              <div className="flex items-center justify-between"><span className="mono text-[11px] text-[var(--color-text-muted)]">{m.k}</span><img src={m.icon} alt="" width={20} height={20} className={m.k.includes("INSTANT") ? "entropy-spin" : ""} /></div>
              <div className="text-3xl font-bold tracking-[-0.02em] tabular-nums">{m.v}</div>
              {m.spark && <div className="h-6 w-full"><svg viewBox="0 0 100 24" className="w-full h-full"><path d={m.spark} className="chart-line" fill="none"/><path d={`${m.spark} L100 24 L0 24 Z`} className="chart-area"/></svg></div>}
              <div className="mono text-xs text-[var(--color-primary)]">{m.accent}</div>
              <div className="mono text-xs text-[var(--color-text-muted)]">{m.sub}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURE GRID - bento, built */}
      <section className="container mt-12">
        <h2 className="heading-lg text-balance">Fund. Reveal. Claim. Govern.</h2>
        <p className="body mt-2 max-w-[560px] text-pretty">Sectors pool mUSDC into PDA vaults. Every deposit mints a Share that later reveals a weight. Weights sum to 1e18 — no zero.</p>
        <div className="dashboard-grid mt-6">
          <motion.div initial={reduce ? false : { opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="card grid-span-8 flex gap-4 items-center">
            <img src={assets.icons.fund} alt="" width={40} height={40} className="shrink-0" />
            <div><div className="mono text-xs text-[var(--color-primary)]">01 — Fund</div><h3 className="text-lg font-semibold mt-1">Deposit. Mint sealed.</h3><p className="body mt-1 text-sm text-pretty">mUSDC to PDA vault → Core Share. One tx per Share, 20 max.</p></div>
            <img src={assets.cards.sealed} alt="" width={80} height={120} className="ml-auto hidden sm:block rounded-lg border border-[var(--color-border)] card-idle-float" />
          </motion.div>
          <motion.div initial={reduce ? false : { opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 }} className="card grid-span-4">
            <div className="flex items-center gap-2"><img src={assets.icons.reveal} alt="" width={28} height={28} /><span className="mono text-xs text-[var(--color-primary)]">02 — Reveal</span></div>
            <h3 className="mt-3 text-lg font-semibold">Slot-hash → weight</h3>
            <p className="body mt-2 text-sm">Commit slot, wait 10, reveal 0.5–2.0× normalized.</p>
            <img src={assets.illustrations.entropy} alt="" width={48} height={48} className="mt-3 entropy-spin opacity-60" />
          </motion.div>
          <motion.div initial={reduce ? false : { opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.16 }} className="card grid-span-4">
            <div className="flex items-center gap-2"><img src={assets.icons.claim} alt="" width={28} height={28} /><span className="mono text-xs text-[var(--color-primary)]">03 — Claim</span></div>
            <h3 className="mt-3 text-lg font-semibold">Claim pro-rata</h3>
            <p className="body mt-2 text-sm"><span className="mono">weight * total / 1e18</span> — burn delegate.</p>
          </motion.div>
          <motion.div initial={reduce ? false : { opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.24 }} className="card grid-span-8 flex gap-4 items-center">
            <img src={assets.icons.govern} alt="" width={40} height={40} />
            <div><div className="mono text-xs text-[var(--color-primary)]">04 — Govern</div><h3 className="text-lg font-semibold mt-1">Futarchy</h3><p className="body mt-1 text-sm">Bonded PASS/FAIL, TWAP decides. Silence = status quo.</p></div>
            <img src={assets.illustrations.market} alt="" width={80} height={80} className="ml-auto hidden sm:block" />
          </motion.div>
        </div>
      </section>

      {/* LIVE SECTORS TABLE - built */}
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
                  { name: "AI Infra", raised: "$68", goal: "$100", shares: "2", pct: 68 },
                  { name: "Energy Vault", raised: "$230", goal: "$250", shares: "4", pct: 92 },
                  { name: "Bio Forge", raised: "$23", goal: "$75", shares: "1", pct: 31 },
                ].map((r, i) => (
                  <motion.tr key={r.name} initial={reduce ? false : { opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                    <td><div className="flex items-center gap-2"><img src={assets.brand.markGlow} alt="" width={24} height={24} className="rounded-full border border-[var(--color-border)] p-1" /><span className="font-semibold">{r.name}</span></div></td>
                    <td className="mono">{r.raised}<div className="h-1 w-16 bg-[var(--color-border)] rounded-full mt-1"><div className="h-full bg-[var(--color-primary)] rounded-full" style={{ width: `${r.pct}%` }} /></div></td>
                    <td className="mono">{r.goal}</td>
                    <td className="mono">{r.shares}</td>
                    <td><span className="status">Funding</span></td>
                    <td><Link href="/sectors" className="btn-compact btn-secondary no-underline">Fund sector</Link></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* WHY + HOW */}
      <section className="container mt-12">
        <div className="dashboard-grid">
          <div className="card grid-span-4">
            <div className="mono text-xs text-[var(--color-primary)]">WHY</div>
            <h3 className="mt-2 text-lg font-semibold text-balance">Collectible finance,<br /><span className="text-[var(--color-text-secondary)]">not a raffle.</span></h3>
            <p className="body mt-2 text-sm text-pretty">Weights sum to 1e18. Backing is real, on-chain, pro-rata.</p>
            <div className="mt-4 grid gap-2">
              {["Ownership for everyone","Real xStocks","Instant Mint"].map(t => (
                <div key={t} className="flex items-center gap-2 mono text-xs"><span className="size-1.5 rounded-full bg-[var(--color-primary)]" />{t}</div>
              ))}
            </div>
          </div>
          <div className="card grid-span-8">
            <p className="mono text-xs tracking-[0.16em] text-[var(--color-primary)]">The flow</p>
            <h3 className="heading-lg mt-2 !text-2xl">Deposit once. Own a slice.</h3>
            <ol className="mt-6 grid gap-4 sm:grid-cols-3">
              <li className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4"><div className="mono text-xs text-[var(--color-primary)]">01 — Fund</div><p className="mt-2 text-sm font-semibold">Join Sector</p><p className="mono text-xs text-[var(--color-text-muted)] mt-1">mUSDC → vault → Share</p></li>
              <li className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4"><div className="mono text-xs text-[var(--color-primary)]">02 — Seal</div><p className="mt-2 text-sm font-semibold">Entropy commits</p><p className="mono text-xs text-[var(--color-text-muted)] mt-1">commit + 10 slots</p></li>
              <li className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4"><div className="mono text-xs text-[var(--color-primary)]">03 — Reveal</div><p className="mt-2 text-sm font-semibold">See %</p><p className="mono text-xs text-[var(--color-text-muted)] mt-1">0.5–2× → 1e18</p></li>
            </ol>
          </div>
        </div>
      </section>

      {/* AFTER REVEAL */}
      <section className="container mt-12">
        <div className="card">
          <div className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
            <div className="rounded-xl border border-[var(--color-border)] bg-[#080909] p-6 grid place-items-center min-h-[24rem] relative overflow-hidden">
              <img src={assets.cards.revealed} alt="" width={160} height={240} className="card-idle-float" />
              <div className="absolute bottom-3 left-3 status">REVEALED · 6.42%</div>
              <div className="absolute top-3 right-3 rounded-full border border-white/20 bg-black/60 px-2 py-1 text-[10px] font-bold">Epic</div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="card"><p className="mono text-xs tracking-[0.16em] text-[var(--color-primary)]">Known ownership</p><p className="mt-4 text-4xl font-bold tracking-[-0.05em] tabular-nums">6.42%</p><p className="body mt-2 text-sm">Exact % used when you claim.</p></div>
              <div className="card"><p className="mono text-xs tracking-[0.16em] text-[var(--color-primary)]">Several stocks</p><div className="mt-4 flex gap-1"><span className="size-10 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] grid place-items-center text-xs">NVDA</span><span className="size-10 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] grid place-items-center text-xs">AAPL</span><span className="size-10 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] grid place-items-center text-xs">TSLA</span></div><p className="body mt-3 text-sm">One claim sends your share of every token.</p></div>
              <div className="card sm:col-span-2">
                <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="mono text-xs tracking-[0.16em] text-[var(--color-primary)]">Claim preview</p><h3 className="mt-2 text-xl font-semibold">See the tokens before you claim.</h3></div><span className="rounded-lg border border-[var(--color-primary)]/30 bg-[var(--color-primary-muted)] px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)]">Epic</span></div>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">{[["NVDA","0.0328"],["AAPL","0.1184"],["TSLA","0.0712"]].map(([sym,amt]) => (<div key={sym} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4"><div className="mono text-xs text-[var(--color-text-muted)]">{sym}</div><div className="mono mt-2 text-sm tabular-nums">{amt}</div></div>))}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mt-12">
        <ProgramStatus />
      </section>

      <section className="container mt-12 mb-12">
        <div className="relative overflow-hidden rounded-2xl border border-[var(--color-primary)]/35 bg-[var(--color-primary)] p-6 text-black sm:p-10">
          <div className="absolute inset-0 hero-grid opacity-20" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="mono text-xs tracking-[0.16em]">Your first Share starts with one Sector.</p>
              <h2 className="mt-4 max-w-4xl text-4xl font-bold leading-[0.95] tracking-[-0.05em] sm:text-5xl text-balance">Choose the Sector. Set the amount. See what your Share reveals.</h2>
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
