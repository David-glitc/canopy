// Digital Matter composition: reveal seed + economic state -> generative genome.
// The output describes rules for a form. It never selects a finished image.
import { dnaFromSeed, pickWeighted } from "./dna.mjs";
import traits from "./traits.json" with { type: "json" };

const TIER = Object.fromEntries(traits.cosmetic.map((item, index) => [item.grade, index]));
const weighted = (values) => values.map((value, index) => ({ value, weight: Math.max(2, 12 - index) }));
const pick = (stream, values) => pickWeighted(stream, weighted(values)).value;

const FORMS = ["Sentinel", "Bloom", "Oracle", "Warden", "Drifter", "Chimera"];
const MATTER = ["Bark", "Crystal", "Mycelium", "Alloy", "Plasma"];
const CORES = ["Seed", "Prism", "Void", "Halo"];
const CROWNS = ["Branches", "Antennae", "Crest", "Orbit", "Uncrowned"];
const AURAS = ["Quiet", "Spore Field", "Solar Rays", "Root Signal", "Static Bloom"];
const MOTIONS = ["Rooted", "Ascending", "Orbiting", "Emergent"];

export function composeCard(seedStr, economicRarity) {
  const { hex, stream } = dnaFromSeed(seedStr);
  const cosmetic = pickWeighted(stream, traits.cosmetic).grade;
  const tier = TIER[cosmetic];
  const silhouette = pick(stream, FORMS);
  const matter = pick(stream, MATTER);
  const core = pick(stream, CORES);
  const crown = pick(stream, CROWNS);
  const aura = pick(stream, AURAS);
  const motion = pick(stream, MOTIONS);
  const symmetry = stream() > 0.18 ? "Bilateral" : "Fractured";
  const eyes = 1 + Math.floor(stream() * (tier >= 3 ? 4 : 3));
  const density = 5 + Math.floor(stream() * 7) + tier;
  const sigilRoll = stream();
  const sigil = tier >= 4 && sigilRoll < 0.18 ? "star" : sigilRoll < 0.38 ? "leaf" : null;

  return {
    dna: hex,
    economicRarity,
    cosmetic,
    silhouette,
    matter,
    core,
    crown,
    aura,
    motion,
    symmetry,
    eyes,
    density,
    wash: traits.washes[cosmetic],
    tier,
    sigil,
    base: `procedural:${silhouette.toLowerCase()}`,
    baseId: silhouette.toLowerCase(),
    frame: `procedural:${cosmetic.toLowerCase()}`,
    rays: aura === "Solar Rays",
    spores: aura === "Spore Field",
    seeds: {
      form: Math.floor(stream() * 1e9),
      surface: Math.floor(stream() * 1e9),
      field: Math.floor(stream() * 1e9),
    },
    traits: [
      { trait_type: "Economic Rarity", value: economicRarity },
      { trait_type: "Matter Grade", value: cosmetic },
      { trait_type: "Form", value: silhouette },
      { trait_type: "Matter", value: matter },
      { trait_type: "Core", value: core },
      { trait_type: "Crown", value: crown },
      { trait_type: "Aura", value: aura },
      { trait_type: "Motion", value: motion },
      { trait_type: "Symmetry", value: symmetry },
      { trait_type: "Eyes", value: String(eyes) },
    ],
  };
}
