import Link from "next/link";
import DigitalMatterLab from "@/components/DigitalMatterLab";
import LandingVaultChart from "@/components/LandingVaultChart";

export default function Home() {
  return (
    <div className="landing-page">
      <section className="landing-hero">
        <div className="shell landing-hero-grid">
          <div className="landing-hero-copy">
            <p className="page-kicker">Tokenized stock collectibles</p>
            <h1>Collect stocks <span>like cards.</span></h1>
            <p>Choose one stock or fund a basket. Mint sealed, reveal a non-zero Share, and let the position assemble its own identity.</p>
            <div className="hero-actions">
              <Link href="/markets" className="btn-primary">Explore stocks <span>↗</span></Link>
              <Link href="/sectors" className="btn-secondary">Browse vaults</Link>
            </div>
            <div className="landing-hero-proof" aria-label="Protocol guarantees">
              <span>Public + pre-IPO</span><span>Shares total 100%</span><span>Verifiable DNA</span>
            </div>
          </div>

          <LandingVaultChart />
        </div>
      </section>

      <section id="how" className="landing-protocol">
        <div className="shell">
          <div className="landing-section-head"><p className="page-kicker">How it works</p><h2>Fund. Reveal. Own.</h2></div>
          <div className="protocol-rail">
            {["Fund", "Close", "Buy", "Reveal", "Own"].map((step, index) => <div key={step}><span>0{index + 1}</span><strong>{step}</strong></div>)}
          </div>
          <p className="protocol-line">Deposit stablecoins. The vault closes, buys its token set, and reveals every Share. Nobody draws zero.</p>
        </div>
      </section>

      <section id="ways-in" className="shell landing-ways">
        <div className="landing-section-head"><p className="page-kicker">Two ways in</p><h2>Mint alone or pool together.</h2></div>
        <div className="landing-way-grid">
          <Link href="/markets" className="landing-way-card"><span>01 · INSTANT</span><h3>One stock.</h3><p>Choose a token, set the position, and reveal immediately.</p><strong>Explore stocks ↗</strong></Link>
          <Link href="/sectors" className="landing-way-card"><span>02 · GROUP VAULT</span><h3>One basket.</h3><p>Fund a 2–5-token vault and reveal with the group.</p><strong>Browse vaults ↗</strong></Link>
        </div>
      </section>

      <section className="shell matter-home landing-matter">
        <div className="matter-home-copy"><p className="page-kicker">Digital Matter</p><h2>The position becomes the character.</h2><p>Basket, timing, deposit, and ownership weight assemble the artifact at reveal.</p><Link href="/matter" className="btn-secondary">See the DNA engine</Link></div>
        <DigitalMatterLab compact />
      </section>

      <section className="proof-strip" aria-label="Data and infrastructure partners"><div className="shell proof-strip-inner"><p>Built with</p><div className="proof-logos"><span>PreStocks</span><span>xStocks</span><span>Pyth</span><span>Solana</span><span>Metaplex</span></div></div></section>
    </div>
  );
}
