import { test } from "node:test";
import assert from "node:assert/strict";
import { composeCard } from "./compose.mjs";
import { dnaFromSeed } from "./dna.mjs";

test("deterministic: same seed twice", () => {
  const a = composeCard("canopy-test-1", "Epic");
  const b = composeCard("canopy-test-1", "Epic");
  assert.deepEqual(a, b);
});

test("distinct seeds differ", () => {
  const a = composeCard("canopy-test-1", "Epic");
  const b = composeCard("canopy-test-2", "Epic");
  assert.notDeepEqual(a, b);
});

test("genome preserves economic state and emits procedural rules", () => {
  for (const s of ["a", "b", "c", "d", "e"]) {
    const c = composeCard("seed-" + s, "Rare");
    assert.equal(c.economicRarity, "Rare");
    assert.match(c.frame, /^procedural:/);
    assert.ok(c.base && c.wash && c.silhouette && c.matter && c.core);
    assert.equal(c.traits.some((trait) => trait.trait_type === "Form"), true);
  }
});

test("procedural forms are reachable", () => {
  const seen = new Set();
  for (let i = 0; i < 500; i++) seen.add(composeCard("dist-" + i, "Common").baseId);
  assert.ok(seen.size >= 6, `expected variety, saw ${seen.size}`);
});

test("star sigil only on Elite+", () => {
  for (let i = 0; i < 2000; i++) {
    const c = composeCard("sigil-" + i, "Common");
    if (c.sigil === "star") assert.ok(["Elite", "Mythic", "Ascendant"].includes(c.cosmetic));
  }
});

test("aura flags map to procedural fields", () => {
  for (let i = 0; i < 500; i++) {
    const c = composeCard("tier-" + i, "Legendary");
    assert.equal(c.rays, c.aura === "Solar Rays");
    assert.equal(c.spores, c.aura === "Spore Field");
  }
});

test("dna hex stable", () => {
  assert.equal(dnaFromSeed("canopy").hex, dnaFromSeed("canopy").hex);
  assert.equal(dnaFromSeed("canopy").hex.length, 14);
});
