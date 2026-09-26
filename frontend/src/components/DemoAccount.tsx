"use client";

import { useState } from "react";
import CompanyLogo from "@/components/CompanyLogo";

const holdings = [
  { symbol: "NVDA", source: "xStocks", weight: 36, value: "$4,623.12", change: "+4.8%" },
  { symbol: "AAPL", source: "xStocks", weight: 24, value: "$3,082.08", change: "+1.3%" },
  { symbol: "ANTHROPIC", source: "PreStocks", weight: 22, value: "$2,825.24", change: "+7.1%" },
  { symbol: "ANDURIL", source: "PreStocks", weight: 18, value: "$2,311.56", change: "+2.6%" },
];

const nextWeights = [
  { symbol: "NVDA", from: 36, to: 44 },
  { symbol: "AAPL", from: 24, to: 16 },
  { symbol: "ANTHROPIC", from: 22, to: 22 },
  { symbol: "ANDURIL", from: 18, to: 18 },
];

function AllocationBar({ weights }: { weights: number[] }) {
  return (
    <div className="demo-allocation-bar" aria-label="Vault allocation">
      {weights.map((weight, index) => <span key={`${weight}-${index}`} style={{ width: `${weight}%` }} />)}
    </div>
  );
}

export default function DemoAccount() {
  const [published, setPublished] = useState(false);

  return (
    <main className="demo-account shell">
      <section className="demo-account-head">
        <div className="demo-account-id">
          <div className="demo-avatar">MC</div>
          <div>
            <p><span>DEMO ACCOUNT</span> · PRODUCT WALKTHROUGH</p>
            <h1>Maya’s Canopy</h1>
            <small>8NGJ···X0Zk · owner and vault member</small>
          </div>
        </div>
        <div className="demo-account-actions"><a href="/canopy-demo.mp4" className="btn-ghost">Watch demo film <span>↗</span></a><a href="#decision-market" className="btn-primary">Open decision market <span>↘</span></a></div>
      </section>

      <section className="demo-metrics" aria-label="Demo account metrics">
        <article className="demo-metric-main"><span>TOTAL CLAIM VALUE</span><strong>$12,842.00</strong><small>+3.8% this cycle</small></article>
        <article><span>DIGITAL MATTER</span><strong>07</strong><small>4 vault · 3 instant</small></article>
        <article><span>VOTING POWER</span><strong>18.4%</strong><small>Across 2 active vaults</small></article>
        <article><span>CANOPY XP</span><strong>3,480</strong><small>Rank #18 this season</small></article>
      </section>

      <section className="demo-account-grid">
        <article className="demo-portfolio-panel" data-demo-shot="portfolio">
          <header>
            <div><p className="vault-section-label">LIVE VAULT NAV</p><h2>Frontier compute</h2></div>
            <div className="demo-nav-value"><strong>$12,842</strong><span>+$471.28</span></div>
          </header>
          <div className="demo-chart" aria-label="NAV increased over the current vault cycle">
            <svg viewBox="0 0 800 210" role="img">
              <defs><linearGradient id="demo-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d7ff72" stopOpacity=".24"/><stop offset="1" stopColor="#d7ff72" stopOpacity="0"/></linearGradient></defs>
              <path className="demo-chart-grid" d="M0 35H800M0 105H800M0 175H800" />
              <path className="demo-chart-area" d="M0 172C55 166 72 140 124 146S201 167 254 130 339 70 400 102 490 129 548 82 620 58 672 68 740 24 800 34V210H0Z" />
              <path className="demo-chart-line" d="M0 172C55 166 72 140 124 146S201 167 254 130 339 70 400 102 490 129 548 82 620 58 672 68 740 24 800 34" />
              <circle cx="800" cy="34" r="6" />
            </svg>
            <div><span>Cycle open</span><span>Now</span></div>
          </div>
          <div className="demo-holdings">
            {holdings.map((holding) => (
              <div key={holding.symbol}>
                <CompanyLogo symbol={holding.symbol} name={holding.symbol} />
                <span><strong>{holding.symbol}</strong><small>{holding.source} · {holding.weight}%</small></span>
                <b>{holding.value}</b><i>{holding.change}</i>
              </div>
            ))}
          </div>
        </article>

        <article className="demo-claim-panel" data-demo-shot="claim">
          <div className="demo-share-card">
            <div className="demo-share-top"><span>CANOPY SHARE</span><b>MYTHIC</b></div>
            <div className="demo-share-orbit"><span></span><span></span><span></span><img src="/mark.svg" alt="" /></div>
            <div className="demo-share-name"><span>THE SIGNAL KEEPER</span><strong>#2841</strong></div>
          </div>
          <div className="demo-claim-copy">
            <div><p className="vault-section-label">TRANSFERABLE CLAIM</p><span className="demo-chain-pill">ONCHAIN</span></div>
            <h2>The collectible is the position.</h2>
            <p>Share #2841 carries Maya’s 12.4% claim on this vault. Its art can evolve; its ownership record cannot.</p>
            <dl><div><dt>OWNERSHIP</dt><dd>12.40%</dd></div><div><dt>CLAIM NAV</dt><dd>$1,592.41</dd></div><div><dt>STATUS</dt><dd>Redeemable</dd></div></dl>
            <button type="button" className="btn-secondary">Inspect ownership record <span>↗</span></button>
          </div>
        </article>
      </section>

      <section id="decision-market" className="demo-governance" data-demo-shot="governance">
        <header className="demo-governance-head">
          <div><p className="vault-section-label">OWNER PROPOSAL · MARKET #07</p><h2>Reweight the vault with a market.</h2><p>Members publish a bonded change. Traders price PASS or FAIL. The result becomes the vault’s public decision record.</p></div>
          <span className="demo-live-pill"><i /> LIVE · 18H LEFT</span>
        </header>

        <div className="demo-governance-grid">
          <article className="demo-reweight-card">
            <div className="demo-proposal-title"><span>PROPOSED BY MAYA · 12.4% OWNER</span><strong>Shift 8% from AAPLx to NVDAx</strong></div>
            <div className="demo-allocation-compare">
              <div><span>CURRENT</span><AllocationBar weights={nextWeights.map((item) => item.from)} /></div>
              <div><span>IF PASS</span><AllocationBar weights={nextWeights.map((item) => item.to)} /></div>
            </div>
            <div className="demo-weight-table">
              {nextWeights.map((item) => <div key={item.symbol}><CompanyLogo symbol={item.symbol} name={item.symbol} /><strong>{item.symbol}</strong><span>{item.from}%</span><i>→</i><b className={item.from !== item.to ? "is-changed" : ""}>{item.to}%</b></div>)}
            </div>
          </article>

          <article className="demo-market-card">
            <div className="demo-market-price"><span>MARKET ODDS</span><strong>67<small>%</small></strong><p>PASS implied</p></div>
            <div className="demo-market-bar"><span style={{ width: "67%" }} /></div>
            <div className="demo-market-sides"><span><i />PASS <strong>$0.67</strong></span><span><i />FAIL <strong>$0.33</strong></span></div>
            <div className="demo-market-facts"><div><span>TRADES</span><strong>84</strong></div><div><span>BONDED</span><strong>$4,210</strong></div><div><span>TWAP</span><strong>1.14</strong></div></div>
            <div className="demo-market-actions"><button type="button" className="btn-primary">Buy PASS</button><button type="button" className="btn-ghost">Buy FAIL</button></div>
          </article>

          <article className="demo-composer-card">
            <div><span>NEW PROPOSAL</span><b>1 USDC bond</b></div>
            <h3>Owners can propose the next composition.</h3>
            <label><span>Action</span><select defaultValue="reweight"><option value="reweight">Reweight NAV</option><option value="asset">Add / remove token</option><option value="cycle">Change funding cycle</option></select></label>
            <label><span>Rationale</span><input defaultValue="Increase compute exposure before earnings" /></label>
            <button type="button" className="btn-primary" onClick={() => setPublished(true)}>{published ? "Proposal staged ✓" : "Preview bonded market"}</button>
            <small>{published ? "Demo preview created. A connected owner publishes the signed market onchain." : "Publishing creates PASS and FAIL positions backed by the proposer’s bond."}</small>
          </article>
        </div>
      </section>

      <section className="demo-moat" data-demo-shot="moat">
        <div><span>01</span><strong>The claim travels.</strong><p>Each NFT is a transferable claim on a real vault position.</p></div>
        <div><span>02</span><strong>The artwork compounds.</strong><p>NAV, ownership, history, and market events assemble the identity.</p></div>
        <div><span>03</span><strong>The vault can decide.</strong><p>Bonded markets turn member proposals into auditable decisions.</p></div>
      </section>
    </main>
  );
}
