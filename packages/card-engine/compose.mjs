// Deterministic card composition: seed + economic rarity -> full layer spec.
// Dual rarity: economic (on-chain weight band, input) + cosmetic (DNA-rolled,
// drives the frame). Pure, no I/O.
import { dnaFromSeed, pickWeighted } from "./dna.mjs";
import traits from "./traits.json" with { type: "json" };

const TIER = Object.fromEntries(
  traits.cosmetic.map((c, i) => [c.grade, i])
);

export function composeCard(seedStr, economicRarity) {
  const { hex, stream } = dnaFromSeed(seedStr);
  const cosmetic = pickWeighted(stream, traits.cosmetic).grade;
  const tier = TIER[cosmetic];
  const base = pickWeighted(stream, traits.bases);

  let sigil = null;
  const r = stream();
  if (tier >= 4 && r < 0.12) sigil = traits.sigils.star;
  else if (r < 0.3) sigil = traits.sigils.leaf;

  const spec = {
    dna: hex,
    economicRarity,
    cosmetic,
    base: base.file,
    baseId: base.id,
    frame: traits.frames[cosmetic],
    sigil,
    wash: traits.washes[cosmetic],
    rays: tier >= 3,
    spores: tier >= 4,
    seeds: {
      grain: Math.floor(stream() * 1e9),
      rays: stream(),
      spores: Math.floor(stream() * 1e9),
    },
    traits: [
      { trait_type: "Economic Rarity", value: economicRarity },
      { trait_type: "Cosmetic Grade", value: cosmetic },
      { trait_type: "Base", value: base.id },
    ],
  };
  if (sigil) {
    spec.traits.push({
      trait_type: "Sigil",
      value: sigil.includes("star") ? "Star" : "Leaf",
    });
  }
  return spec;
}
