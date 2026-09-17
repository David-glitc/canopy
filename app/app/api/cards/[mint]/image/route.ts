import { NextRequest, NextResponse } from "next/server";
import { renderCardBuffer } from "@art/generator/render-card.mjs";
import { fetchShare } from "@/lib/card-data";

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
    return new NextResponse(new Uint8Array(png), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch {
    return NextResponse.json({ error: "render failed" }, { status: 500 });
  }
}
