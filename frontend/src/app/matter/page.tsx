import Link from "next/link";
import DigitalMatterLab from "@/components/DigitalMatterLab";

export const metadata = {
  title: "Digital Matter",
  description: "How Canopy assembles unique collectible forms from on-chain DNA at reveal time.",
};

export default function MatterPage() {
  return (
    <div className="matter-page">
      <section className="shell matter-hero">
        <div className="matter-hero-copy">
          <span className="live-label"><i /> DIGITAL MATTER THEORY · 01</span>
          <p className="page-kicker">The reveal is the birth</p>
          <h1>No image exists until the chain decides.</h1>
          <p>
            A Canopy collectible begins as sealed potential. Funding position, vault state, reveal
            entropy, and its index become DNA. The renderer interprets that DNA into a being in real time.
          </p>
          <div className="hero-actions">
            <Link href="/instant" className="btn-primary">Create matter <span>↗</span></Link>
            <Link href="/sectors" className="btn-secondary">Enter a group vault</Link>
          </div>
        </div>
        <div className="matter-hero-side">
          <span>NOT A PFP DROP</span>
          <strong>∞</strong>
          <p>There is no catalog of finished editions. The protocol stores causes. The renderer produces form.</p>
        </div>
      </section>

      <section className="shell matter-lab-section">
        <div className="matter-section-head">
          <div><p className="page-kicker">Live genotype explorer</p><h2>DNA becomes visible matter.</h2></div>
          <p>These prototypes trace the same geometry system now used by the live collectible renderer.</p>
        </div>
        <DigitalMatterLab />
      </section>

      <section className="matter-process">
        <div className="shell">
          <div className="matter-section-head">
            <div><p className="page-kicker">Assembly cycle</p><h2>State → seed → form.</h2></div>
            <p>The artwork can be reconstructed from its inputs, but nobody can pick a finished character before reveal.</p>
          </div>
          <div className="matter-steps">
            <article><span>01 / SEALED</span><strong>Economic state accumulates.</strong><p>Deposit weight, vault membership, and collectible index establish the material conditions.</p></article>
            <article><span>02 / ENTROPY</span><strong>The reveal commits DNA.</strong><p>A delayed on-chain reveal seed joins each position index, preventing a curator from choosing the outcome.</p></article>
            <article><span>03 / PHENOTYPE</span><strong>Rules assemble the being.</strong><p>Form, matter, core, crown, aura, symmetry, and every surface pixel are generated when requested.</p></article>
          </div>
        </div>
      </section>

      <section className="shell matter-manifesto">
        <p>DIGITAL MATTER THEORY</p>
        <blockquote>
          “The collectible is not the file. It is the repeatable relationship between an on-chain
          history and the form that history produces.”
        </blockquote>
        <div>
          <span><i>01</i> No preminted image set</span>
          <span><i>02</i> Deterministic reconstruction</span>
          <span><i>03</i> Traits with economic origin</span>
          <span><i>04</i> Runtime pixel assembly</span>
        </div>
      </section>
    </div>
  );
}
