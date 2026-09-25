import { NextRequest, NextResponse } from "next/server";
import { renderCardBuffer } from "@art/generator/render-card.mjs";
import { fetchShare } from "@/lib/card-data";
import sharp from "sharp";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ mint: string }> }
) {
  const { mint } = await params;
  const grove = req.nextUrl.searchParams.get("grove") ?? undefined;
  const index = req.nextUrl.searchParams.get("index") ?? undefined;
  const share = await fetchShare(mint, grove ?? undefined, index ?? undefined);
  if (!share || !share.seedStr) {
    return NextResponse.json({ error: "sealed or unknown" }, { status: 404 });
  }
  try {
    const { png } = await renderCardBuffer(share.seedStr, share.economicRarity);
    let finished = png;
    if (share.position) {
      const symbol = share.position.symbol.replace(/[^A-Z0-9]/gi, "").slice(0, 18);
      const logoSymbol = symbol.endsWith("X") ? symbol.slice(0, -1) : symbol;
      const source = share.position.source.toUpperCase();
      const label = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1200">
        <rect x="42" y="1014" width="716" height="116" rx="22" fill="#080b0a" fill-opacity=".90" stroke="#d9ff72" stroke-opacity=".68" stroke-width="2"/>
        <rect x="68" y="1042" width="60" height="60" rx="15" fill="#d9ff72"/>
        <text x="98" y="1082" text-anchor="middle" font-family="Arial, sans-serif" font-size="25" font-weight="800" fill="#071008">${symbol.slice(0, 2)}</text>
        <text x="148" y="1066" font-family="Arial, sans-serif" font-size="30" font-weight="800" fill="#ffffff">${symbol}</text>
        <text x="148" y="1094" font-family="monospace" font-size="15" font-weight="700" letter-spacing="2" fill="#a1a7a3">${source} · 100% TARGET</text>
        <text x="712" y="1081" text-anchor="end" font-family="monospace" font-size="16" font-weight="700" fill="#d9ff72">CANOPY SHARE</text>
      </svg>`);
      const layers: Array<{ input: Buffer; left?: number; top?: number }> = [{ input: label }];
      try {
        const logo = await readFile(join(process.cwd(), "public", "company-logos", `${logoSymbol}.png`));
        layers.push({
          input: await sharp(logo).resize(48, 48, { fit: "contain" }).png().toBuffer(),
          left: 74,
          top: 1048,
        });
      } catch {
        // The monogram in the label remains when a local stock logo is absent.
      }
      finished = await sharp(png).composite(layers).png().toBuffer();
    }
    return new NextResponse(new Uint8Array(finished), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch {
    return NextResponse.json({ error: "render failed" }, { status: 500 });
  }
}
