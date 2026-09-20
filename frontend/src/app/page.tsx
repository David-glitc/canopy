import Link from "next/link"
import { DynamicWidget } from "@dynamic-labs/sdk-react-core"

export default function Home() {
  return (
    <div className="bg-[#050505] text-[#F5F7F7]">
      {/* NAV - minimal, single line */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#050505]/80 border-b border-[#1B2421]">
        <div className="max-w-[1280px] mx-auto px-6 h-[64px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <div className="size-8 rounded-lg bg-gradient-to-br from-[#14f195] to-[#9945FF] grid place-items-center font-mono text-xs font-bold text-black">C</div>
            <span className="font-bold tracking-[-0.02em]">CANOPY</span>
            <span className="hidden sm:inline-flex ml-2 rounded-full border border-[#14f195]/20 bg-[#14f195]/10 px-2 py-0.5 font-mono text-[10px] text-[#14f195]">DEVNET</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/sectors" className="text-[#A2AAA8] hover:text-white no-underline">Sectors</Link>
            <Link href="/instant" className="text-[#A2AAA8] hover:text-white no-underline">Instant</Link>
            <Link href="/shop" className="text-[#A2AAA8] hover:text-white no-underline">Shop</Link>
          </nav>
          <DynamicWidget />
        </div>
      </header>

      {/* HERO - editorial, 2-col, not centered */}
      <section className="max-w-[1280px] mx-auto px-6 grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center py-16 lg:py-24">
        <div>
          <div className="inline-flex items-center gap-2 mono text-xs">
            <span className="size-2 rounded-full bg-[#14f195] animate-pulse" />
            <span className="font mono text-xs tracking-[0.14em] text-[#14f195]">LIVE ON SOLANA DEVNET</span>
          </div>
          <h1 className="mt-4 text-[42px] sm:text-[56px] font-bold leading-[0.9] tracking-[-0.03em] text-balance">
            Collectible<br />
            <span className="bg-gradient-to-r from-[#14f195] to-[#9945FF] bg-clip-text text-transparent">claims on</span><br />
            tokenized equity.
          </h1>
          <p className="mt-5 max-w-[480px] text-[17px] leading-[1.6] text-[#A2AAA8] text-pretty">
            A Sector is a vault. A Share is a key. Fund with mUSDC, reveal your weight, claim pro-rata — or govern by market.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/instant" className="inline-flex h-11 items-center justify-center rounded-full bg-[#14f195] px-6 text-sm font-semibold text-black hover:brightness-110">Launch app — $1.50</Link>
            <Link href="/sectors" className="inline-flex h-11 items-center justify-center rounded-full border border-[#1B2421] px-6 text-sm font-medium hover:border-[#14f195]/30">Explore sectors</Link>
          </div>
          <div className="mt-6 flex items-center gap-3 mono text-xs text-[#68716E]">
            <span>mock mUSDC</span><span>·</span><span>slot-hash entropy</span><span>·</span><span>Core Shares</span>
          </div>
        </div>
        <div className="relative hidden lg:block">
          <div className="rounded-2xl border border-[#1B2421] bg-[#101114] overflow-hidden shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
            <div className="h-9 flex items-center gap-2 px-4 border-b border-[#1B2421] bg-[#0B0B0D]">
              <span className="size-2.5 rounded-full bg-[#ff5c7a]" /><span className="size-2.5 rounded-full bg-[#f5c451]" /><span className="size-2.5 rounded-full bg-[#14f195]" />
              <span className="mono text-xs text-[#68716E] ml-2">canopy/terminal — Sector #42 · 68% funded</span>
            </div>
            <div className="p-6">
              <div className="aspect-[16/10] rounded-xl border border-[#1B2421] bg-[#080909] grid place-items-center">
                <div className="text-center">
                  <div className="size-12 mx-auto rounded-xl bg-[#14f195]/10 border border-[#14f195]/20 grid place-items-center">◆</div>
                  <div className="mono text-xs text-[#68716E] mt-3">PDA vault · Core Share</div>
                  <div className="text-sm font-bold mt-1">Sealed → Reveal → Claim</div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-xl border border-[#1B2421] bg-[#050505] p-3 text-center"><div className="mono text-[10px] text-[#68716E]">RAISED</div><div className="mono text-sm font-bold">$230 / $250</div></div>
                <div className="rounded-xl border border-[#1B2421] bg-[#050505] p-3 text-center"><div className="mono text-[10px] text-[#68716E]">SHARES</div><div className="text-sm font-bold">4</div></div>
                <div className="rounded-xl bg-[#14f195] p-3 text-center"><div className="mono text-[10px] text-black/60">ACTION</div><div className="text-xs font-bold text-black">Fund →</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROOF STRIP */}
      <section className="border-y border-[#1B2421] bg-[#0B0B0D]/50">
        <div className="max-w-[1280px] mx-auto px-6 flex flex-wrap items-center justify-between gap-4 py-3">
          <span className="mono text-xs text-[#68716E]">Built on</span>
          <div className="flex items-center gap-6 mono text-xs font-medium">
            <span>Solana</span><span className="text-[#1B2421]">·</span><span>Metaplex Core</span><span className="text-[#1B2421]">·</span><span>Jupiter</span><span className="text-[#1B2421]">·</span><span>Pyth</span>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS - 3 steps, not 4 equal */}
      <section className="max-w-[1280px] mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold tracking-[-0.02em]">Fund. Reveal. Claim.</h2>
        <p className="mt-2 max-w-[520px] text-[15px] leading-[1.6] text-[#A2AAA8]">Sectors pool mUSDC into PDA vaults. Every deposit mints a Share that later reveals a weight. Weights sum to 1e18.</p>
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-[#1B2421] bg-[#101114] p-6">
            <div className="mono text-xs text-[#14f195]">01 — Fund</div>
            <h3 className="font-semibold mt-2">Deposit. Mint sealed.</h3>
            <p className="mono text-xs text-[#68716E] mt-2">mUSDC → PDA vault → Core Share · 20 max</p>
          </div>
          <div className="rounded-2xl border border-[#1B2421] bg-[#101114] p-6">
            <div className="mono text-xs text-[#14f195]">02 — Reveal</div>
            <h3 className="font-semibold mt-2">Slot-hash → weight</h3>
            <p className="mono text-xs text-[#68716E] mt-2">commit + 10 slots → 0.5–2.0× normalized</p>
          </div>
          <div className="rounded-2xl border border-[#1B2421] bg-[#101114] p-6">
            <div className="mono text-xs text-[#14f195]">03 — Claim</div>
            <h3 className="font-semibold mt-2">Claim pro-rata</h3>
            <p className="mono text-xs text-[#68716E] mt-2">weight * total / 1e18 · burn delegate</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[1280px] mx-auto px-6 pb-16">
        <div className="rounded-2xl border border-[#14f195]/20 bg-[#14f195] p-8 text-black">
          <h2 className="text-2xl font-bold tracking-[-0.02em]">Choose the Sector. See what your Share reveals.</h2>
          <div className="mt-4 flex gap-3">
            <Link href="/sectors" className="inline-flex h-10 items-center justify-center rounded-full bg-black px-5 text-sm font-bold text-white">Explore sectors →</Link>
            <Link href="/instant" className="inline-flex h-10 items-center justify-center rounded-full border border-black/20 px-5 text-sm font-bold">Instant mint — $1.50</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
