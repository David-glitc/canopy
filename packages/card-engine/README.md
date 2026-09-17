# @canopy/card-engine

Deterministic Share compositor. Pure, dependency-free, isomorphic.

- `dna.mjs` — `cyrb53` + `mulberry32` seed stream.
- `traits.json` — base variants, cosmetic grades, washes, frames, sigils.
- `compose.mjs` — `composeCard(seedStr, economicRarity)` → layer spec + traits.
  Dual rarity: economic (chain) + cosmetic (DNA frame).
- DNA sources: pool = `hash(revealSeed || index)` (RevealState on-chain);
  instant = `dna` attribute (minted on-chain).
- Rendered by `art/generator/render-card.mjs` (sharp) and the app metadata
  route (D7). Tests: `node --test test.mjs`.
