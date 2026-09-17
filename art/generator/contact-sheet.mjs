// Tile layer PNGs side-by-side for visual QA.
import sharp from "sharp";

const files = process.argv.slice(2);
if (files.length < 1) throw new Error("usage: node contact-sheet.mjs <out.png> <in1.png> ...");
const [out, ...ins] = files;
const metas = await Promise.all(ins.map((f) => sharp(f).metadata()));
const W = metas[0].width, H = metas[0].height;
const sheet = sharp({
  create: { width: W * ins.length, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 1 } },
});
await sheet
  .composite(ins.map((input, i) => ({ input, left: i * W, top: 0 })))
  .png()
  .toFile(out);
console.log(`contact sheet -> ${out} (${W * ins.length}x${H})`);
