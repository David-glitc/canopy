// Render brand SVGs to PNG exports (favicons, touch icons, OG-ready logo).
import { Resvg } from "@resvg/resvg-js";
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const BRAND = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "brand");
const svg = (n) => readFileSync(join(BRAND, n), "utf8");
const out = (n, png) => {
  writeFileSync(join(BRAND, n), Buffer.from(png));
  console.log(n, png.length + "b");
};

const mark = svg("mark.svg");
out("mark-512.png", new Resvg(mark, { fitTo: { mode: "width", value: 512 } }).render().asPng());
const logo = svg("logo.svg");
out("logo.png", new Resvg(logo, { fitTo: { mode: "width", value: 1024 } }).render().asPng());
const fav = svg("favicon.svg");
out("favicon-64.png", new Resvg(fav, { fitTo: { mode: "width", value: 64 } }).render().asPng());
out("favicon-32.png", new Resvg(fav, { fitTo: { mode: "width", value: 32 } }).render().asPng());
out("apple-touch-icon.png", new Resvg(fav, { fitTo: { mode: "width", value: 180 } }).render().asPng());
