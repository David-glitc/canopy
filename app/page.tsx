import Link from "next/link"
import ProgramStatus from "./components/ProgramStatus"
import { assets } from "@/assets"

export default function Home() {
  return (
    <div className="bg-[#050505]">
      {/* HERO - editorial, asymmetric, built */}
      <section className="relative overflow-hidden border-b border-[#1B2421]">
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `linear-gradient(#14f195 1px, transparent 1px), linear-gradient(90deg, #14f195 1px, transparent 1px)`, backgroundSize: "80px 80px" }} />
          <div className="absolute -top-20 -right-20 w-[680px] h-[680px] bg-gradient-to-br from-[#14f195]/[0.06] via-[#9945FF]/[0.04] to-transparent blur-[60px] rounded-full" />
        </div>
        <div className="container relative grid lg:grid-cols-[1.15fr_0.85fr] gap-8 lg:gap-16 items-start pt-28 pb-16 lg:pt-36 lg:pb-24">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-12 bg-[#14f195]" />
              <span className="mono text-[11px] font-bold tracking-[0.16em] text-[#14f195]">CANOPY</span>
              <span className="mono text-[11px] text-[#68716E]">— SOLANA DEVNET</span>
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-[#14f195] px-2 py-1 mono text-[10px] font-bold text-black">LIVE</span>
            </div>
            <h1 className="mt-6 font-display text-[52px] sm:text-[68px] lg:text-[84px] font-[900] leading-[0.84] tracking-[-0.05em] text-balance">
              Collectible<br />
              <span className="bg-gradient-to-r from-[#14f195] via-[#00FFA3] to-[#9945FF] bg-clip-text text-transparent">claims on</span><br />
              <span className="text-white">tokenized equity.</span>
            </h1>
            <p className="mt-6 text-[18px] leading-[1.6] text-[#A2AAA8] max-w-[480px] text-pretty">
              A Sector is a <span className="text-white font-medium">PDA vault</span>. A Share is a <span className="text-white font-medium">Core key</span>. Fund, reveal, claim — <span className="text-white">or govern by market.</span>
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/instant" className="btn-primary h-[52px] px-8 text-[15px] shadow-[0_0_24px_rgba(20,241,149,0.18)]">Launch app — $1.50 →</Link>
              <Link href="/sectors" className="btn-secondary h-[52px] px-8">View sectors</Link>
            </div>
            <div className="mt-10 flex items-center gap-4 border-t border-[#1B2421] pt-6 max-w-[420px]">
              <div className="flex -space-x-2">
                <img src="/assets/brand/mark-glow.svg" alt="" width={28} height={28} className="rounded-full border-2 border-[#050505] bg-[#0a0f0e] p-1" />
                <div className="size-7 rounded-full bg-[#14f195] border-2 border-[#050505] grid place-items-center mono text-[10px] font-bold text-black">20</div>
                <div className="size-7 rounded-full bg-[#9945FF] border-2 border-[#050505] grid place-items-center mono text-[10px] font-bold text-white">1e18</div>
              </div>
              <span className="mono text-xs text-[#68716E]">20 max shares · 1e18 weight · slot-hash entropy</span>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="card p-0 overflow-hidden rotate-[-0.7deg] hover:rotate-0 transition-transform duration-500 shadow-2xl">
              <div className="h-10 flex items-center gap-2 px-4 bg-[#0a0f0e] border-b border-[#1B2421]">
                <span className="size-2.5 rounded-full bg-[#ff5c7a]" /><span className="size-2.5 rounded-full bg-[#f5c451]" /><span className="size-2.5 rounded-full bg-[#14f195]" />
                <span className="mono text-xs text-[#68716E] ml-2">canopy/terminal — Sector #42 · 68% funded</span>
                <span className="ml-auto status text-[10px]">Funding</span>
              </div>
              <img src={assets.hero.terminal} alt="" width={480} height={320} className="w-full" />
              <div className="p-3 bg-[#0a0f0e] border-t border-[#1B2421] grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-[#050505] border border-[#1B2421] p-2.5"><div className="mono text-[10px] text-[#68716E]">RAISED</div><div className="mono text-xs font-bold mt-1">$230 / $250</div><div className="h-1 bg-[#1B2421] rounded-full mt-1.5"><div className="h-full w-[92%] bg-[#14f195] rounded-full" /></div></div>
                <div className="rounded-xl bg-[#050505] border border-[#1B2421] p-2.5 text-center"><div className="mono text-[10px] text-[#68716E]">SHARES</div><div className="text-lg font-bold">4</div><div className="mono text-xs text-[#68716E]">+16 for reveal</div></div>
                <div className="rounded-xl bg-[#14f195] p-2.5 text-black text-center"><div className="mono text-[10px] opacity-70">ACTION</div><div className="text-xs font-bold mt-1">Fund →</div></div>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 card p-3 hidden xl:flex items-center gap-3">
              <img src={assets.illustrations.vault} alt="" width={32} height={32} />
              <div><div className="mono text-xs text-[#68716E]">VAULT TVL</div><div className="text-sm font-bold mono">$12,420.00</div></div>
            </div>
            <div className="absolute -top-4 -right-4 card p-2 flex items-center gap-2">
              <div className="size-8 rounded-full bg-[#14f195]/10 grid place-items-center"><span className="mono text-xs font-bold text-[#14f195]">S</span></div>
              <div><div className="mono text-[10px] text-[#68716E]">ENTROPY</div><div className="mono text-xs font-bold">Slot 739M</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="border-y border-[#1B2421] bg-[#0a0f0e] overflow-hidden py-3">
        <div className="flex gap-8 animate-activity-scroll whitespace-nowrap">
          {["Share #42 minted · $5.00","Sector AI Infra → 68%","Instant #128 revealed · Epic","Vault $230 / $250","Slot-hash 739,421,008"].map(t => (
            <span key={t} className="mono text-xs text-[#68716E] flex items-center gap-2"><span className="size-1.5 rounded-full bg-[#14f195]" />{t}</span>
          ))}
        </div>
      </div>

      {/* BENTO */}
      <section className="container mt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card md:col-span-2 min-h-[220px] flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#14f195] opacity-[0.04] blur-[40px] rounded-full group-hover:opacity-[0.08] transition-opacity" />
            <div><div className="inline-flex items-center gap-2 mono text-xs text-[#14f195]"><img src={assets.icons.fund} alt="" width={16} height={16} /> 01 — Fund</div><h3 className="text-[22px] font-bold mt-2 leading-tight">Deposit. Mint sealed.</h3><p className="body mt-2 text-sm max-w-[360px]">mUSDC to PDA vault → Core Share. One tx per Share, 20 max. PDA ATA vault, Token-2022.</p></div>
            <img src={assets.cards.sealed} alt="" width={96} height={144} className="absolute right-4 bottom-4 hidden sm:block rounded-xl border border-[#1B2421] rotate-[-1deg] group-hover:rotate-0 transition-transform duration-300 shadow-lg" />
          </div>
          <div className="card flex flex-col justify-between relative overflow-hidden">
            <div><div className="mono text-xs text-[#14f195]">02 — Reveal</div><h3 className="font-bold mt-2">Slot-hash → weight</h3></div>
            <div className="size-16 rounded-2xl bg-[#0a0f0e] border border-[#1B2421] grid place-items-center mt-4"><img src={assets.illustrations.entropy} alt="" width={32} height={32} className="entropy-spin opacity-80" /></div>
            <p className="mono text-xs text-[#68716E] mt-3">commit + 10 slots → 0.5–2.0×</p>
          </div>
          <div className="card flex flex-col justify-between">
            <div><div className="mono text-xs text-[#14f195]">03 — Claim</div><h3 className="font-bold mt-2">Claim pro-rata</h3></div>
            <div className="mt-4 rounded-xl bg-[#080909] border border-[#1B2421] p-3 mono text-xs"><div className="text-[#68716E]">weight * total / 1e18</div><div className="font-bold text-[#14f195] mt-1">burn delegate</div></div>
            <p className="mono text-xs text-[#68716E] mt-3">No custody. PDA vault pays.</p>
          </div>
          <div className="card md:col-span-2 flex gap-4 items-center">
            <div className="size-14 rounded-xl bg-[#9945FF]/10 border border-[#9945FF]/20 grid place-items-center shrink-0"><img src={assets.icons.govern} alt="" width={28} height={28} /></div>
            <div className="flex-1"><div className="mono text-xs text-[#9945FF]">04 — Govern</div><h3 className="font-bold mt-1">Futarchy</h3><p className="mono text-xs text-[#68716E] mt-1">Bonded PASS/FAIL · TWAP decides · Silence = status quo</p></div>
            <img src={assets.illustrations.market} alt="" width={72} height={72} className="hidden sm:block" />
          </div>
        </div>
      </section>

      <section className="container mt-12">
        <ProgramStatus />
      </section>
    </div>
  )
}
