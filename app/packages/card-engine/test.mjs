import { test } from "node:test";
import assert from "node:assert/strict";
import { composeCard } from "./compose.mjs";
import { dnaFromSeed } from "./dna.mjs";
import traits from "./traits.json" with { type: "json" };

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

test("frame matches cosmetic grade; economic preserved", () => {
  for (const s of ["a", "b", "c", "d", "e"]) {
    const c = composeCard("seed-" + s, "Rare");
    assert.equal(c.economicRarity, "Rare");
    assert.equal(c.frame, traits.frames[c.cosmetic]);
    assert.ok(c.base && c.wash);
  }
});

test("base weights sum positive; all bases reachable", () => {
  const sum = traits.bases.reduce((s, b) => s + b.weight, 0);
  assert.ok(sum > 0);
  const seen = new Set();
  for (let i = 0; i < 500; i++) seen.add(composeCard("dist-" + i, "Common").baseId);
  assert.ok(seen.size >= 8, `expected variety, saw ${seen.size}`);
});

test("star sigil only on Elite+", () => {
  for (let i = 0; i < 2000; i++) {
    const c = composeCard("sigil-" + i, "Common");
    if (c.sigil && c.sigil.includes("star")) {
      assert.ok(["Elite", "Mythic", "Ascendant"].includes(c.cosmetic));
    }
  }
});

test("rays/spores flags follow tier", () => {
  for (let i = 0; i < 500; i++) {
    const c = composeCard("tier-" + i, "Legendary");
    const tier = ["Forged", "Refined", "Masterwork", "Elite", "Mythic", "Ascendant"].indexOf(c.cosmetic);
    assert.equal(c.rays, tier >= 3);
    assert.equal(c.spores, tier >= 4);
  }
});

test("dna hex stable", () => {
  assert.equal(dnaFromSeed("canopy").hex, dnaFromSeed("canopy").hex);
  assert.equal(dnaFromSeed("canopy").hex.length, 14);
});
