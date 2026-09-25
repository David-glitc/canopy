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
    if (share.tokenSet.length > 0) {
      const tokenSet = share.tokenSet.slice(0, 5).map((token) => ({
        ...token,
        symbol: token.symbol.replace(/[^A-Z0-9]/gi, "").slice(0, 14),
      }));
      const badges = tokenSet.map((token, tokenIndex) => {
        const x = 68 + tokenIndex * 52;
        return `<rect x="${x}" y="1042" width="44" height="44" rx="11" fill="#d9ff72"/><text x="${x + 22}" y="1071" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="800" fill="#071008">${token.symbol.slice(0, 2)}</text>`;
      }).join("");
      const textX = 78 + tokenSet.length * 52;
      const basket = tokenSet.map((token) => `${token.symbol} ${token.weight.toFixed(0)}%`).join(" · ");
      const basketFontSize = tokenSet.length > 3 ? 12 : tokenSet.length > 1 ? 15 : 18;
      const source = tokenSet.length === 1 ? tokenSet[0].source.toUpperCase() : "SIGNED TOKEN SET";
      const label = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1200">
        <rect x="42" y="1014" width="716" height="116" rx="22" fill="#080b0a" fill-opacity=".90" stroke="#d9ff72" stroke-opacity=".68" stroke-width="2"/>
        ${badges}
        <text x="${textX}" y="1062" font-family="Arial, sans-serif" font-size="${basketFontSize}" font-weight="800" fill="#ffffff">${basket}</text>
        <text x="${textX}" y="1089" font-family="monospace" font-size="13" font-weight="700" letter-spacing="1.5" fill="#a1a7a3">${source}</text>
        <text x="712" y="1120" text-anchor="end" font-family="monospace" font-size="14" font-weight="700" fill="#d9ff72">CANOPY SHARE</text>
      </svg>`);
      const layers: Array<{ input: Buffer; left?: number; top?: number }> = [{ input: label }];
      for (const [tokenIndex, token] of tokenSet.entries()) {
        const logoSymbol = token.symbol.endsWith("X") ? token.symbol.slice(0, -1) : token.symbol;
        try {
          const logo = await readFile(join(process.cwd(), "public", "company-logos", `${logoSymbol}.png`));
          layers.push({
            input: await sharp(logo).resize(36, 36, { fit: "contain" }).png().toBuffer(),
            left: 72 + tokenIndex * 52,
            top: 1046,
          });
        } catch {
          // The monogram in the label remains when a local stock logo is absent.
        }
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
