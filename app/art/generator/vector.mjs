// Crisp vector chrome: rarity frames, sealed pod, sigils. No text (app overlays
// HTML type). Transparent centers; composited over pixel layers via sharp.
import { writeFileSync, mkdirSync } from "node:fs";

const W = 800, H = 1200;

const PALETTES = {
  forged:     { base: "#2b2b30", trim: "#8a4b2a", glow: "#5a2f18", gem: "#6e3a1f" },
  refined:    { base: "#33302a", trim: "#a07a3f", glow: "#6b4e26", gem: "#c08a3e" },
  masterwork: { base: "#2c3134", trim: "#b8c0c8", glow: "#5f6f5a", gem: "#7fd08a" },
  elite:      { base: "#0b2e25", trim: "#2fd08a", glow: "#0e5c46", gem: "#37f2a8" },
  mythic:     { base: "#0a0a0f", trim: "#d4af37", glow: "#7a5c14", gem: "#ffd75e" },
  ascendant:  { base: "#101018", trim: "url(#holo)", glow: "#7a5cff", gem: "url(#holo)" },
};

function defs(p, rarity) {
  const holo = rarity === "ascendant"
    ? `<linearGradient id="holo" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#ff5c5c"/><stop offset=".25" stop-color="#ffb13d"/>
        <stop offset=".5" stop-color="#52ffa8"/><stop offset=".75" stop-color="#52b8ff"/>
        <stop offset="1" stop-color="#c86bff"/>
      </linearGradient>` : "";
  return `<defs>${holo}
    <linearGradient id="edge" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${p.trim}" stop-opacity=".95"/>
      <stop offset=".5" stop-color="${p.base}"/>
      <stop offset="1" stop-color="${p.trim}" stop-opacity=".9"/>
    </linearGradient>
    <radialGradient id="glow" cx=".5" cy=".42" r=".75">
      <stop offset=".55" stop-color="${p.glow}" stop-opacity="0"/>
      <stop offset="1" stop-color="${p.glow}" stop-opacity=".55"/>
    </radialGradient>
  </defs>`;
}

function corners(tier) {
  // tier 0..5 controls ornament density
  const n = 2 + tier;
  let s = "";
  const spots = [[36, 36], [W - 36, 36], [36, H - 36], [W - 36, H - 36]];
  for (const [cx, cy] of spots) {
    for (let i = 0; i < n; i++) {
      const r = 10 + i * 9;
      s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="FILL" stroke-width="3" opacity="${0.9 - i * 0.18}"/>`;
    }
    s += `<circle cx="${cx}" cy="${cy}" r="5" fill="FILL"/>`;
  }
  return s;
}

export function frameSVG(rarity) {
  const p = PALETTES[rarity];
  const tier = Object.keys(PALETTES).indexOf(rarity);
  const F = "FILL";
  const corner = corners(tier).split(F).join(p.trim);
  const glass = (tier >= 3)
    ? `<polygon points="0,0 ${W},0 ${W * 0.42},${H} 0,${H}" fill="#ffffff" opacity="0.06"/>
       <polygon points="${W},0 ${W},${H * 0.5} ${W * 0.62},0" fill="#ffffff" opacity="0.09"/>` : "";
  const gemY = 96;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`
    + defs(p, rarity)
    + `<rect x="0" y="0" width="${W}" height="${H}" rx="44" fill="url(#glow)"/>`
    + `<rect x="26" y="26" width="${W - 52}" height="${H - 52}" rx="30" fill="none" stroke="${p.trim}" stroke-width="${10 + tier * 2}"/>`
    + `<rect x="52" y="150" width="${W - 104}" height="${H - 420}" rx="18" fill="none" stroke="${p.trim}" stroke-width="5" opacity=".85"/>`
    + corner + glass
    + `<polygon points="${W / 2},${gemY - 34} ${W / 2 + 30},${gemY} ${W / 2},${gemY + 34} ${W / 2 - 30},${gemY}" fill="${p.gem}" stroke="${p.trim}" stroke-width="4"/>`
    + `<rect x="90" y="${H - 218}" width="${W - 180}" height="118" rx="16" fill="${p.base}" stroke="${p.trim}" stroke-width="4" opacity=".96"/>`
    + `</svg>`;
}

export function sealSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`
    + `<defs><radialGradient id="pod" cx=".5" cy=".46" r=".7">
      <stop offset="0" stop-color="#1d3a24"/><stop offset=".6" stop-color="#0b1a10"/>
      <stop offset="1" stop-color="#030705"/></radialGradient>
      <linearGradient id="crack" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffd75e"/><stop offset="1" stop-color="#8a5c14"/></linearGradient></defs>`
    + `<rect x="0" y="0" width="${W}" height="${H}" rx="44" fill="url(#pod)"/>`
    + `<ellipse cx="${W / 2}" cy="${H * 0.46}" rx="215" ry="290" fill="none" stroke="url(#crack)" stroke-width="10" opacity=".9"/>`
    + `<ellipse cx="${W / 2}" cy="${H * 0.46}" rx="150" ry="215" fill="none" stroke="url(#crack)" stroke-width="5" opacity=".7"/>`
    + `<polygon points="${W / 2},${H * 0.46 - 72} ${W / 2 + 52},${H * 0.46} ${W / 2},${H * 0.46 + 72} ${W / 2 - 52},${H * 0.46}" fill="none" stroke="url(#crack)" stroke-width="7"/>`
    + `<circle cx="${W / 2}" cy="${H * 0.46}" r="16" fill="#ffd75e" opacity=".95"/>`
    + `<rect x="26" y="26" width="${W - 52}" height="${H - 52}" rx="30" fill="none" stroke="#3d5a34" stroke-width="10"/>`
    + `</svg>`;
}

export function sigilSVG(kind) {
  const c = kind === "leaf" ? "#7fd08a" : "#ffd75e";
  const inner = kind === "leaf"
    ? `<path d="M60 10 C95 35 95 85 60 110 C25 85 25 35 60 10 Z" fill="${c}"/><path d="M60 22 L60 98" stroke="#0b1a10" stroke-width="6"/>`
    : `<polygon points="60,8 72,44 110,44 79,66 90,102 60,80 30,102 41,66 10,44 48,44" fill="${c}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">${inner}<circle cx="60" cy="60" r="56" fill="none" stroke="${c}" stroke-width="5" opacity=".8"/></svg>`;
}

// CLI: node vector.mjs (writes all)
mkdirSync("art/layers/vector", { recursive: true });
for (const r of Object.keys(PALETTES)) {
  writeFileSync(`art/layers/vector/frame-${r}.svg`, frameSVG(r));
  console.log("frame-" + r);
}
writeFileSync("art/layers/vector/seal.svg", sealSVG());
writeFileSync("art/layers/vector/sigil-leaf.svg", sigilSVG("leaf"));
writeFileSync("art/layers/vector/sigil-star.svg", sigilSVG("star"));
console.log("seal + sigils");
