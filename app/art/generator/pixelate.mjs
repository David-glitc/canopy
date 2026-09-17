// JPEG concept art -> pixelated SVG (in-memory) -> PNG layer + palette.
// Models 2D pixel layers from the download.zip references: coarse grid,
// median flattening, uniform quantization, row run-length rects.
import sharp from "sharp";
import { Resvg } from "@resvg/resvg-js";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, basename } from "node:path";

const DEF_COLS = 72;
const DEF_ROWS = 108; // 2:3 card
const DEF_LEVELS = 5; // per-channel posterize levels
const OUT_W = 800;

const makeQuant = (levels) => (v) =>
  Math.round((v / 255) * (levels - 1)) * Math.round(255 / (levels - 1));
const hex = (r, g, b) => `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;

export async function pixelate(inputJpeg, outPng, outPalette, opts = {}) {
  const COLS = opts.cols ?? DEF_COLS;
  const ROWS = opts.rows ?? DEF_ROWS;
  const LEVELS = opts.levels ?? DEF_LEVELS;
  const quant = makeQuant(LEVELS);
  const { data } = await sharp(inputJpeg)
    .resize(COLS, ROWS, { fit: "cover", kernel: "lanczos3" })
    .median(2)
    .raw()
    .toBuffer({ resolveWithObject: true })
    .then(({ data, info }) => ({ data, info }));

  // Quantize + RLE rows into rects; count palette.
  const counts = new Map();
  let rects = "";
  let runs = 0;
  for (let y = 0; y < ROWS; y++) {
    let x = 0;
    while (x < COLS) {
      const o = (y * COLS + x) * 3;
      const r = quant(data[o]), g = quant(data[o + 1]), b = quant(data[o + 2]);
      const c = hex(r, g, b);
      counts.set(c, (counts.get(c) ?? 0) + 1);
      let run = 1;
      while (x + run < COLS) {
        const o2 = (y * COLS + x + run) * 3;
        if (quant(data[o2]) === r && quant(data[o2 + 1]) === g && quant(data[o2 + 2]) === b) run++;
        else break;
      }
      rects += `<rect x="${x}" y="${y}" width="${run}" height="1" fill="${c}"/>`;
      runs++;
      x += run;
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${COLS}" height="${ROWS}" viewBox="0 0 ${COLS} ${ROWS}" shape-rendering="crispEdges">${rects}</svg>`;
  const png = new Resvg(svg, { fitTo: { mode: "width", value: OUT_W } })
    .render()
    .asPng();
  mkdirSync(dirname(outPng), { recursive: true });
  writeFileSync(outPng, png);
  const palette = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 14).map(([color, px]) => ({ color, px }));
  if (outPalette) writeFileSync(outPalette, JSON.stringify({ source: basename(inputJpeg), grid: [COLS, ROWS], levels: LEVELS, runs, palette }, null, 2));
  console.log(`${basename(inputJpeg)} -> ${basename(outPng)} (${runs} rects, ${palette.length} palette)`);
  return { png: outPng, palette };
}

// CLI: node pixelate.mjs <in.jpg> <out.png> [palette.json] [cols] [rows] [levels]
const [input, output, pal, cols, rows, levels] = process.argv.slice(2);
if (input && output) {
  const opts = {};
  if (cols) opts.cols = parseInt(cols, 10);
  if (rows) opts.rows = parseInt(rows, 10);
  if (levels) opts.levels = parseInt(levels, 10);
  await pixelate(input, output, pal, opts);
}
