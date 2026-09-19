import { NextRequest, NextResponse } from "next/server";
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
  if (!share) {
    return NextResponse.json({ error: "unknown" }, { status: 404 });
  }
  const origin = req.nextUrl.origin;
  const qs = grove && index ? `?grove=${grove}&index=${index}` : "";
  const attributes = [
    { trait_type: "Economic Rarity", value: share.economicRarity },
    ...Object.entries(share.attrs).map(([trait_type, value]) => ({
      trait_type,
      value,
    })),
  ];
  return NextResponse.json(
    {
      name: `Canopy ${share.economicRarity} Share`,
      symbol: "CANOPY",
      description:
        "A collectible cipher-key backed by real tokenized equity. Chrome, signal, math.",
      image: share.seedStr ? `${origin}/api/cards/${mint}/image${qs}` : undefined,
      external_url: `${origin}/share/${mint}${qs}`,
      attributes,
      properties: { category: "image" },
    },
    { headers: { "Cache-Control": "public, max-age=60" } }
  );
}
