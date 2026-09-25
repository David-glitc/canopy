import Link from "next/link";
import CompanyLogo from "@/components/CompanyLogo";
import DigitalMatterLab from "@/components/DigitalMatterLab";

export default function Home() {
  return (
    <div className="landing-page">
      <section className="hero landing-hero">
        <div className="shell hero-grid">
          <div className="hero-copy-block">
            <p className="page-kicker">Collectible stock ownership</p>
            <h1 className="hero-title">Fund the basket. <span>Reveal your Share.</span></h1>
            <p className="hero-copy">Pool capital into tokenized stocks. Mint sealed. Reveal a non-zero claim on the vault—and a one-of-one artifact built from the position.</p>
            <div className="hero-actions">
              <Link href="/app" className="btn-primary">Open Canopy</Link>
              <a href="#how" className="btn-secondary">How it works</a>
            </div>
            <div className="hero-note"><span><i />Weights total 100%</span><span><i />No zero outcomes</span><span><i />Verifiable DNA</span></div>
          </div>

          <div className="collectible-stage" aria-label="Canopy collectible backed by a stock token set">
            <div className="specimen-card landing-specimen">
              <div className="specimen-head"><span className="specimen-mark"><img src="/mark.svg" alt="" /></span><span className="specimen-series">VAULT SHARE · 01</span></div>
              <div className="specimen-art landing-specimen-art">
                <div className="landing-token-orbit">
                  <CompanyLogo symbol="NVDA" name="NVIDIA" />
                  <CompanyLogo symbol="AAPL" name="Apple" />
                  <CompanyLogo symbol="OPENAI" name="OpenAI" />
                </div>
                <span className="specimen-symbol">12.4%</span>
              </div>
              <div className="specimen-foot"><span className="specimen-name">Mythic Share</span><span className="specimen-price"><strong>3 tokens</strong><span>claim weight</span></span></div>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="landing-protocol">
        <div className="shell">
          <div className="landing-section-head"><p className="page-kicker">The protocol</p><h2>Five moves. One real position.</h2></div>
          <div className="protocol-rail">
            {["Fund", "Close", "Buy", "Reveal", "Own"].map((step, index) => <div key={step}><span>0{index + 1}</span><strong>{step}</strong></div>)}
          </div>
          <p className="protocol-line">Deposit stablecoins → stocks enter the vault → bounded randomness assigns ownership → hold, trade, or redeem the Share.</p>
        </div>
      </section>

      <section id="ways-in" className="shell landing-ways">
        <div className="landing-section-head"><p className="page-kicker">Two ways in</p><h2>Pull solo. Reveal together.</h2></div>
        <div className="landing-way-grid">
          <Link href="/markets" className="landing-way-card"><span>01 · INSTANT</span><h3>Choose one stock.</h3><p>Create a micro-position and reveal its Digital Matter immediately.</p><strong>Explore markets ↗</strong></Link>
          <Link href="/sectors" className="landing-way-card"><span>02 · GROUP VAULT</span><h3>Fund a token set.</h3><p>Join a named 2–5 stock vault, mint sealed, and reveal as a group.</p><strong>Browse vaults ↗</strong></Link>
        </div>
      </section>

      <section className="shell matter-home landing-matter">
        <div className="matter-home-copy"><p className="page-kicker">Digital Matter</p><h2>Economics become identity.</h2><p>Basket, timing, deposit, and ownership weight assemble every artifact. No premade editions.</p><Link href="/matter" className="btn-secondary">Enter the DNA engine</Link></div>
        <DigitalMatterLab compact />
      </section>

      <section className="proof-strip" aria-label="Data and infrastructure partners"><div className="shell proof-strip-inner"><p>Built with</p><div className="proof-logos"><span>PreStocks</span><span>xStocks</span><span>Pyth</span><span>Solana</span><span>Metaplex</span></div></div></section>
    </div>
  );
}
