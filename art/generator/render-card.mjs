// Compose a finished Share PNG from a card-engine spec:
// base pixel art + rarity wash + vignette + grain + rays/spores + frame + sigil.
import sharp from "sharp";
import { readFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { composeCard } from "../../packages/card-engine/compose.mjs";
import { mulberry32 } from "../../packages/card-engine/dna.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LAYERS = join(ROOT, "layers");
const W = 800, H = 1200;

const svgBuf = (s) => Buffer.from(s);

function washSVG(color) {
  return svgBuf(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="${color}" opacity="0.22"/></svg>`);
}
function vignetteSVG() {
  return svgBuf(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs><radialGradient id="v" cx=".5" cy=".46" r=".78"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#v)"/></svg>`);
}
function grainSVG(seed) {
  const r = mulberry32(seed);
  let c = "";
  for (let i = 0; i < 380; i++) {
    const x = (r() * W).toFixed(1), y = (r() * H).toFixed(1);
    const rad = (1 + r() * 1.8).toFixed(1);
    const col = r() > 0.5 ? "#fff" : "#000";
    c += `<circle cx="${x}" cy="${y}" r="${rad}" fill="${col}" opacity="${(0.04 + r() * 0.08).toFixed(2)}"/>`;
  }
  return svgBuf(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${c}</svg>`);
}
function raysSVG(seed) {
  const r = mulberry32(Math.floor(seed * 977));
  let p = "";
  for (let i = 0; i < 5; i++) {
    const x0 = W * 0.5 + (r() - 0.5) * 300;
    const spread = 40 + r() * 90;
    p += `<polygon points="${x0},-20 ${x0 + spread},-20 ${x0 + spread * 2.2},${H} ${x0 - spread * 0.4},${H}" fill="#fff" opacity="${(0.05 + r() * 0.05).toFixed(2)}"/>`;
  }
  return svgBuf(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${p}</svg>`);
}
function sporesSVG(seed, color) {
  const r = mulberry32(seed);
  let c = "";
  for (let i = 0; i < 42; i++) {
    const x = (r() * W).toFixed(1), y = (r() * H).toFixed(1);
    const rad = (2 + r() * 4).toFixed(1);
    c += `<circle cx="${x}" cy="${y}" r="${(rad * 2.4).toFixed(1)}" fill="${color}" opacity="0.18"/><circle cx="${x}" cy="${y}" r="${rad}" fill="#fff" opacity="0.75"/>`;
  }
  return svgBuf(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${c}</svg>`);
}

export async function renderCard(seedStr, economicRarity, outPng) {
  const spec = composeCard(seedStr, economicRarity);
  const layers = [
    { input: join(LAYERS, spec.base) },
    { input: washSVG(spec.wash), blend: "multiply" },
    { input: vignetteSVG() },
    { input: grainSVG(spec.seeds.grain) },
  ];
  if (spec.rays) layers.push({ input: raysSVG(spec.seeds.rays), blend: "screen" });
  if (spec.spores) layers.push({ input: sporesSVG(spec.seeds.spores, spec.wash), blend: "screen" });
  layers.push({ input: readFileSync(join(LAYERS, spec.frame)) });
  if (spec.sigil) {
    layers.push({
      input: await sharp(readFileSync(join(LAYERS, spec.sigil))).resize(120, 120).toBuffer(),
      left: 648,
      top: 30,
    });
  }
  mkdirSync(dirname(outPng), { recursive: true });
  await sharp(layers[0].input).composite(layers.slice(1)).png().toFile(outPng);
  console.log(`${seedStr} [${economicRarity}/${spec.cosmetic}] -> ${outPng}`);
  return spec;
}

// CLI: node render-card.mjs <seed> <rarity> <out.png>
const [seed, rarity, out] = process.argv.slice(2);
if (seed && rarity && out) await renderCard(seed, rarity, out);
