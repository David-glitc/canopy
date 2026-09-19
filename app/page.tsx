import ProgramStatus from "./components/ProgramStatus";

export default function Home() {
  return (
    <div className="home-v2 min-h-screen">
      {/* HERO - full bleed like stonk */}
      <section className="v2-hero">
        {/* background - gradient + grid */}
        <div className="absolute inset-0 bg-[#0a0a0a]">
          <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: `linear-gradient(rgba(207,255,4,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(207,255,4,0.06) 1px, transparent 1px)`, backgroundSize: "56px 56px" }} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/70 to-transparent" />
          <div className="absolute left-1/2 top-[22%] h-[420px] w-[680px] -translate-x-1/2 rounded-full bg-[#cfff04] opacity-[0.07] blur-[90px]" />
        </div>
        <div className="v2-hero-scrim" />
        <div className="v2-hero-ui mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="max-w-[720px]">
            <div className="v2-pill live"><span className="h-1.5 w-1.5 rounded-full bg-[var(--canopy-lime)] animate-pulse" />● LIVE ON DEVNET</div>
            <h1 className="mt-4 font-display text-[34px] sm:text-[48px] lg:text-[56px] font-extrabold leading-[0.95] tracking-[-0.03em] text-white">
              THE STONK BROKER<br />TERMINAL <span className="text-[var(--canopy-lime)]">— FOR CANOPY</span>
            </h1>
            <p className="mt-3 max-w-[640px] text-[13px] sm:text-[14px] leading-[1.6] text-[#9e9e9e]">
              Fund Sectors. Mint sealed Shares. Reveal how much of the vault you own — then govern it by market, not by whales. Chrome, signal, math. On Solana.
            </p>
            <div className="v2-hero-ctas">
              <a href="/instant" className="v2-btn v2-btn-p">Mint Instant — $1.50</a>
              <a href="/sectors" className="v2-btn v2-btn-s">Explore Sectors</a>
              <a href="https://explorer.solana.com/address/9xmniHhMGswjyMGf9jW7YCireJaUARBozRSDWYU1Jrnf?cluster=devnet" target="_blank" rel="noreferrer" className="v2-btn v2-btn-s">Explorer ↗</a>
            </div>
            <div className="v2-hero-dots"><span className="v2-hdot on" /><span className="v2-hdot" /><span className="v2-hdot" /><span className="v2-hdot" /></div>
            <div className="v2-pills">
              <span className="v2-pill"><b>4,444</b> ciphers max</span>
              <span className="v2-pill"><b>1.5M</b> min pull</span>
              <span className="v2-pill"><b>1%</b> treasury</span>
              <span className="v2-pill live">● devnet live</span>
              <span className="v2-pill">mock mUSDC</span>
              <span className="v2-pill">slot-hash entropy</span>
            </div>
          </div>
          {/* hero stats card like stonk */}
          <div className="mt-8 grid max-w-[720px] grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              ["RAISED", "$—", "across Sectors"],
              ["VAULT", "$—", "backing live"],
              ["SHARES", "—", "sealed + revealed"],
              ["MARKETS", "—", "futarchy TWAP"],
            ].map(([k, v, s]) => (
              <div key={k} className="v2-card p-3">
                <div className="v2-kicker text-[10px]">{k}</div>
                <div className="v2-title text-[18px] text-white mt-1">{v}</div>
                <div className="text-[11px] text-[#9e9e9e]">{s}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OVERLAYER STATUS - stonk style sec */}
      <section className="v2-sec">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="v2-sec-h">
            <div className="v2-hrow"><h2>Overlayer status</h2><span className="v2-info">i</span></div>
            <span className="v2-mono text-[11px] text-[#9e9e9e]">programs · devnet · Jupiter + Pyth ready</span>
          </div>
          <ProgramStatus />
          <p className="v2-tip mt-3">Devnet demo · mock mUSDC/xStocks · mainnet runs real xStocks via Jupiter. Real equity marks via Pyth. No custody beyond vault PDAs.</p>
        </div>
      </section>

      {/* SPECIAL PROJECTS PARTNERS -> SECTORS */}
      <section id="sectors" className="v2-sec">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="v2-sec-h">
            <h2>Sectors — funding cells</h2>
            <a href="/sectors" className="v2-mono text-[11px] text-[var(--canopy-lime)] no-underline hover:underline">View all →</a>
          </div>
          <p className="v2-tip max-w-[720px] -mt-2 mb-4">Independent funding cells. Each has a goal, deadline, and min. Fund to mint a sealed Share. Close on goal, cancel + refund if short. Reveal decides your cut.</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { name: "AI Infra", desc: "Pre-IPO compute + models", goal: "$100", meta: "goal · 5d · 2 shares" },
              { name: "Energy Vault", desc: "Tokenized grids + batteries", goal: "$250", meta: "goal · 3d · live" },
              { name: "Bio Forge", desc: "Longevity + lab assets", goal: "$75", meta: "goal · 7d · funding" },
              { name: "Space Weld", desc: "Launch + sat equity", goal: "$500", meta: "goal · 14d · funding" },
              { name: "Neon Market", desc: "Consumer xStocks basket", goal: "$50", meta: "goal · 2d · funding" },
              { name: "Cipher House", desc: "House vault · instant pulls", goal: "$1.50+", meta: "solo · instant reveal" },
            ].map((s) => (
              <a key={s.name} href="/sectors" className="v2-card v2-partner p-0 no-underline">
                <div className="h-[86px] relative bg-[#0f0f0f] border-b border-[hsla(0,0%,100%,.06)] overflow-hidden">
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `radial-gradient(circle at 30% 30%, rgba(207,255,4,.22), transparent 55%)` }} />
                  <div className="v2-partner-mark"><img src="/mark.svg" alt="" width={22} height={22} className="opacity-80" /></div>
                  <div className="v2-partner-overlay" />
                  <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                    <span className="v2-pill !h-5 !text-[10px] !px-2 !py-0">● {s.meta}</span>
                    <span className="v2-pill !h-5 !bg-[var(--canopy-lime)] !text-[#111] !border-[var(--canopy-lime)]">{s.goal}</span>
                  </div>
                </div>
                <div className="v2-partner-reveal">
                  <div className="v2-mono text-[12px] font-bold text-white">{s.name}</div>
                  <div className="text-[12px] leading-[1.4] text-[#9e9e9e] mt-1 line-clamp-2">{s.desc}</div>
                  <div className="mt-3 inline-flex h-7 items-center rounded-full bg-[#111] border border-[hsla(0,0%,100%,.08)] px-3 text-[11px] font-bold tracking-[.06em] uppercase text-white">Fund →</div>
                </div>
              </a>
            ))}
          </div>
          <p className="v2-tip mt-3">Mock mUSDC on devnet. On mainnet, USDC + xStocks (Token-2022) with Jupiter execution.</p>
        </div>
      </section>

      {/* HOW MULTIPLIERS WORK -> HOW CANOPY WORKS */}
      <section className="v2-sec">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="v2-sec-h"><h2>How Canopy works</h2><a href="/docs" className="v2-mono text-[11px] text-[#9e9e9e] no-underline">View docs</a></div>
          <div className="grid gap-3 lg:grid-cols-3">
            <div className="v2-card p-4">
              <div className="v2-kicker">01 — Fund</div>
              <div className="font-bold text-white mt-1">Deposit. Mint sealed.</div>
              <p className="text-[12px] leading-[1.5] text-[#9e9e9e] mt-2">Every deposit transfers mUSDC to the Sector vault (PDA ATA) and mints a sealed Core NFT Share (Metaplex Core). Max 20 shares per Sector, one tx per Share.</p>
              <div className="v2-pills mt-3"><span className="v2-pill">goal</span><span className="v2-pill">deadline</span><span className="v2-pill">min</span></div>
            </div>
            <div className="v2-card p-4">
              <div className="v2-kicker">02 — Reveal</div>
              <div className="font-bold text-white mt-1">Slot-hash → weights.</div>
              <p className="text-[12px] leading-[1.5] text-[#9e9e9e] mt-2">Close on goal. Commit slot, wait 10, reveal with future slot hash. Deposit-weighted 0.5–2.0× rolls normalized to 1e18. Rarity follows ownership share.</p>
              <div className="v2-pills mt-3"><span className="v2-pill">commit</span><span className="v2-pill">10 slots</span><span className="v2-pill">reveal</span></div>
            </div>
            <div className="v2-card p-4">
              <div className="v2-kicker">03 — Claim or Govern</div>
              <div className="font-bold text-white mt-1">Burn claim or futarchy.</div>
              <p className="text-[12px] leading-[1.5] text-[#9e9e9e] mt-2">Revealed Shares claim pro-rata `weight * total / 1e18` from vault (burn delegate). Established Sectors govern via PASS/FAIL conditional markets — TWAP decides.</p>
              <div className="v2-pills mt-3"><span className="v2-pill">claim</span><span className="v2-pill">TWAP</span><span className="v2-pill">no rug</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* TOKEN AIR DROPS -> INSTANT */}
      <section id="instant" className="v2-sec">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="v2-sec-h"><h2>Instant — solo pull</h2><a href="/instant" className="v2-btn v2-btn-p !h-7 !px-3 !text-[11px]">Open /instant</a></div>
          <div className="grid gap-3 lg:grid-cols-[1.1fr_.9fr]">
            <div className="v2-card p-5">
              <div className="v2-kicker">From $1.50 · 1% to treasury</div>
              <div className="text-[18px] font-bold text-white mt-1">Your own micro-vault, minted + revealed in one tx.</div>
              <p className="text-[12px] leading-[1.5] text-[#9e9e9e] mt-2">Same engine, zero waiting. Solo weight always 1e18 (Legendary). Visual DNA rolls from slot hash so pulls still look unique. Claim any time — same `claim` as groves.</p>
              <div className="v2-pills mt-3"><span className="v2-pill">vault backing</span><span className="v2-pill">fee 100bps</span><span className="v2-pill">instant</span></div>
              <a href="/instant" className="v2-btn v2-btn-p mt-4">Mint Instant →</a>
            </div>
            <div className="v2-card p-0 overflow-hidden">
              <div className="h-[220px] bg-[#0f0f0f] relative grid place-items-center">
                <img src="/mark.svg" alt="" width={64} height={64} className="opacity-20" />
                <span className="absolute bottom-3 left-3 v2-pill">sealed → revealed · same tx</span>
              </div>
              <div className="p-4 flex items-center justify-between">
                <span className="v2-mono text-[12px] font-bold">Canopy Instant #—</span><span className="v2-pill">100% · Legendary</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OPENING BELL -> LIFECYCLE */}
      <section className="v2-sec">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="v2-sec-h"><h2>Lifecycle — permissionless cranks</h2><span className="v2-mono text-[11px] text-[#9e9e9e]">anyone may push a ready Sector forward</span></div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Funding", "Goal not met → anyone funds."],
              ["Closed", "Goal met → Seal."],
              ["Commit → 10 slots", "Snapshot close slot."],
              ["Revealed → Claim", "Weights → pro-rata payout."],
            ].map(([t, d]) => (
              <div key={t} className="v2-card p-4">
                <div className="v2-kicker">{t}</div>
                <div className="text-[12px] text-[#9e9e9e] mt-1">{d}</div>
              </div>
            ))}
          </div>
          <p className="v2-tip mt-3">Cancelled Sectors (deadline, underfunded) open refunds. Futarchy markets (pass/fail) open on Revealed Sectors — TWAP {" > "} 1 decides pass.</p>
        </div>
      </section>

      {/* FOOT CTA like stonk */}
      <section className="v2-sec !border-b-0">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="v2-card p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="v2-kicker">Live on devnet · Verification next</div>
              <div className="text-[13px] text-[#9e9e9e] mt-1">Programs unaudited. Core BurnV1 close unverified on this devnet Core version (claim ships as mark+pay). xStocks exclude US persons.</div>
            </div>
            <div className="flex gap-2">
              <a href="/sectors" className="v2-btn v2-btn-p">Open Sectors</a>
              <a href="https://github.com/David-glitc/canopy" target="_blank" rel="noreferrer" className="v2-btn v2-btn-s">GitHub</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
