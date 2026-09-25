# @canopy/card-engine

Deterministic Digital Matter genome. Pure, dependency-free, isomorphic.

- `dna.mjs` — `cyrb53` + `mulberry32` seed stream.
- `traits.json` — weighted matter grades and palette signals.
- `compose.mjs` — `composeCard(seedStr, economicRarity)` → procedural genome.
  It defines form, matter, core, crown, aura, motion, symmetry, eyes, density,
  and render seeds. It never selects a finished character image.
- DNA sources: pool = `hash(revealSeed || index)` (RevealState on-chain);
  instant = `dna` attribute (minted on-chain).
- Rendered at request time by `art/generator/render-card.mjs`. The renderer
  builds every pixel and path from the genome, then emits PNG through sharp.
