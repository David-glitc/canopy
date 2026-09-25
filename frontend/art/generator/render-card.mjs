// Digital Matter renderer. Every visible pixel is assembled from DNA at request
// time. No finished character, body, or edition image is selected from storage.
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { composeCard } from "../../packages/card-engine/compose.mjs";
import { mulberry32 } from "../../packages/card-engine/dna.mjs";

const W = 800;
const H = 1200;
const P = 16;

const PALETTES = {
  Forged: ["#17141d", "#5e3440", "#aa5f47", "#e5aa6d", "#f6dab0"],
  Refined: ["#16161c", "#43516d", "#6d83ad", "#b5c7da", "#f0e3cb"],
  Masterwork: ["#101a18", "#315d51", "#64a17c", "#a5d09f", "#e8f2c4"],
  Elite: ["#071a18", "#0f6656", "#27bc83", "#8bf0b6", "#d7ff72"],
  Mythic: ["#191306", "#765313", "#c8982c", "#ffd75e", "#fff2af"],
  Ascendant: ["#110c20", "#543bd3", "#a35efa", "#59d8e8", "#f5bcff"],
};

const rect = (x, y, w, h, fill, opacity = 1) =>
  `<rect x="${x * P}" y="${y * P}" width="${w * P}" height="${h * P}" fill="${fill}" opacity="${opacity}"/>`;

function bodyWidth(form, row, random) {
  const t = row / 25;
  if (form === "Sentinel") return Math.max(4, Math.round(8 + Math.sin(t * Math.PI) * 6));
  if (form === "Bloom") return Math.max(4, Math.round(6 + Math.sin(t * Math.PI) * 9 + (row % 4 === 0 ? 2 : 0)));
  if (form === "Oracle") return Math.max(4, Math.round(5 + t * 9));
  if (form === "Warden") return Math.max(5, Math.round(11 - Math.abs(t - .45) * 8));
  if (form === "Drifter") return Math.max(3, Math.round(6 + Math.sin(t * Math.PI * 2) * 3 + t * 3));
  return Math.max(4, Math.round(7 + random() * 6));
}

function crownPixels(spec, palette) {
  const c = palette[3];
  if (spec.crown === "Uncrowned") return "";
  if (spec.crown === "Branches") return [
    rect(21, 18, 2, 5, c), rect(27, 18, 2, 5, c),
    rect(18, 15, 2, 5, c), rect(30, 15, 2, 5, c),
    rect(16, 13, 4, 2, c), rect(30, 13, 4, 2, c),
  ].join("");
  if (spec.crown === "Antennae") return [
    rect(21, 14, 2, 8, c), rect(27, 14, 2, 8, c),
    rect(19, 12, 3, 2, palette[4]), rect(28, 12, 3, 2, palette[4]),
  ].join("");
  if (spec.crown === "Crest") return [
    rect(23, 13, 4, 9, c), rect(21, 16, 8, 3, palette[2]), rect(24, 11, 2, 3, palette[4]),
  ].join("");
  return `<ellipse cx="400" cy="280" rx="112" ry="35" fill="none" stroke="${c}" stroke-width="12" opacity=".85"/>`;
}

function fieldPixels(spec, palette) {
  const random = mulberry32(spec.seeds.field);
  let out = "";
  const count = 18 + spec.density * 2;
  for (let i = 0; i < count; i++) {
    const x = 4 + Math.floor(random() * 42);
    const y = 9 + Math.floor(random() * 49);
    const size = random() > .78 ? 2 : 1;
    const color = palette[2 + Math.floor(random() * 3)];
    out += rect(x, y, size, size, color, .2 + random() * .65);
  }
  if (spec.aura === "Solar Rays") {
    out += `<path d="M400 72L496 420H304Z M112 480L368 520 184 624Z M688 480L432 520 616 624Z" fill="${palette[3]}" opacity=".09"/>`;
  }
  if (spec.aura === "Root Signal") {
    out += `<path d="M400 790V1018M400 914L260 1044M400 914L540 1044M320 862L210 946M480 862L590 946" fill="none" stroke="${palette[2]}" stroke-width="12" opacity=".45"/>`;
  }
  if (spec.aura === "Static Bloom") {
    out += `<path d="M180 290H300V220H350M620 290H500V220H450M140 650H275V720H340M660 650H525V720H460" fill="none" stroke="${palette[3]}" stroke-width="8" opacity=".35"/>`;
  }
  return out;
}

function creaturePixels(spec, palette) {
  const random = mulberry32(spec.seeds.form);
  let body = "";
  const center = 25;
  for (let row = 0; row < 26; row++) {
    const half = bodyWidth(spec.silhouette, row, random);
    const jitter = spec.symmetry === "Fractured" && row % 5 === 0 ? Math.floor(random() * 3) - 1 : 0;
    const color = row % 5 === 0 ? palette[2] : row % 3 === 0 ? palette[1] : palette[2];
    body += rect(center - half + jitter, 22 + row, half * 2, 1, color);
    if (row % 4 === 1) body += rect(center - half + 1 + jitter, 22 + row, Math.max(1, half - 2), 1, palette[3], .42);
  }
  body += crownPixels(spec, palette);

  const eyeY = 28;
  const eyeXs = spec.eyes === 1 ? [25] : spec.eyes === 2 ? [21, 29] : spec.eyes === 3 ? [20, 25, 30] : [19, 23, 27, 31];
  for (const x of eyeXs) body += rect(x - 1, eyeY, 2, 2, palette[4]);

  const coreColor = spec.core === "Void" ? palette[0] : palette[4];
  if (spec.core === "Prism") {
    body += `<path d="M400 512l64 72-64 72-64-72z" fill="${coreColor}" opacity=".94"/>`;
  } else if (spec.core === "Halo") {
    body += `<circle cx="400" cy="584" r="58" fill="none" stroke="${coreColor}" stroke-width="15"/><circle cx="400" cy="584" r="12" fill="${palette[4]}"/>`;
  } else {
    body += `<circle cx="400" cy="584" r="48" fill="${coreColor}"/><circle cx="386" cy="568" r="10" fill="${palette[3]}" opacity=".7"/>`;
  }

  const surface = mulberry32(spec.seeds.surface);
  for (let i = 0; i < spec.density * 3; i++) {
    const x = 15 + Math.floor(surface() * 20);
    const y = 25 + Math.floor(surface() * 20);
    body += rect(x, y, surface() > .7 ? 2 : 1, 1, palette[surface() > .55 ? 3 : 4], .35 + surface() * .5);
  }
  return body;
}

function matterSVG(spec) {
  const palette = PALETTES[spec.cosmetic];
  const accent = palette[3];
  const tierLines = 2 + spec.tier;
  let corners = "";
  for (let i = 0; i < tierLines; i++) {
    const d = 34 + i * 12;
    corners += `<path d="M${d} 150V${d}H150 M650 ${d}H${800 - d}V150 M${d} 1050V${1200 - d}H150 M650 ${1200 - d}H${800 - d}V1050" fill="none" stroke="${accent}" stroke-width="3" opacity="${Math.max(.08, .55 - i * .07)}"/>`;
  }
  const sigil = spec.sigil === "star"
    ? `<path d="M688 96l10 25h27l-21 16 8 26-24-15-23 15 8-26-22-16h28z" fill="${palette[4]}"/>`
    : spec.sigil === "leaf"
      ? `<path d="M688 92c36 23 35 58 0 79-35-21-36-56 0-79zm0 15v49" fill="${palette[3]}" stroke="${palette[0]}" stroke-width="5"/>`
      : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" shape-rendering="crispEdges">
    <defs>
      <radialGradient id="bg" cx=".5" cy=".42" r=".74"><stop offset="0" stop-color="${palette[1]}"/><stop offset=".62" stop-color="${palette[0]}"/><stop offset="1" stop-color="#050408"/></radialGradient>
      <filter id="glow"><feGaussianBlur stdDeviation="9" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <rect width="800" height="1200" rx="44" fill="url(#bg)"/>
    <g opacity=".16">${Array.from({ length: 49 }, (_, i) => `<path d="M${i * P} 0v1200" stroke="${palette[3]}" stroke-width="1"/>`).join("")}</g>
    <g>${fieldPixels(spec, palette)}</g>
    <g filter="url(#glow)" opacity=".32"><circle cx="400" cy="560" r="${190 + spec.tier * 15}" fill="none" stroke="${accent}" stroke-width="18"/></g>
    <g>${creaturePixels(spec, palette)}</g>
    <g>${corners}</g>
    <rect x="24" y="24" width="752" height="1152" rx="30" fill="none" stroke="${accent}" stroke-width="${8 + spec.tier * 2}" opacity=".9"/>
    <path d="M72 1000H728V1118H72Z" fill="${palette[0]}" opacity=".82" stroke="${accent}" stroke-width="4"/>
    <text x="104" y="1050" fill="${palette[4]}" font-family="monospace" font-size="25" font-weight="700">DIGITAL MATTER / ${spec.silhouette.toUpperCase()}</text>
    <text x="104" y="1090" fill="${palette[3]}" font-family="monospace" font-size="18">DNA ${spec.dna} · ${spec.matter.toUpperCase()} · ${spec.core.toUpperCase()}</text>
    ${sigil}
  </svg>`;
}

export async function renderCardBuffer(seedStr, economicRarity) {
  const spec = composeCard(seedStr, economicRarity);
  const png = await sharp(Buffer.from(matterSVG(spec))).png().toBuffer();
  return { png, spec };
}

export async function renderCard(seedStr, economicRarity, outPng) {
  const { png, spec } = await renderCardBuffer(seedStr, economicRarity);
  mkdirSync(dirname(outPng), { recursive: true });
  writeFileSync(outPng, png);
  console.log(`${seedStr} [${economicRarity}/${spec.cosmetic}] -> ${outPng}`);
  return spec;
}

const [seed, rarity, out] = process.argv.slice(2);
if (seed && rarity && out) await renderCard(seed, rarity, out);
