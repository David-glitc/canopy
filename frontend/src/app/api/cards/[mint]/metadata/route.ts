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
  const marketAsset = req.nextUrl.searchParams.get("asset")?.slice(0, 24).toUpperCase();
  const marketContract = req.nextUrl.searchParams.get("contract")?.slice(0, 64);
  const marketPrice = Number(req.nextUrl.searchParams.get("price"));
  const share = await fetchShare(mint, grove ?? undefined, index ?? undefined);
  if (!share) {
    return NextResponse.json({ error: "unknown" }, { status: 404 });
  }
  const origin = req.nextUrl.origin;
  const qs = grove && index ? `?grove=${grove}&index=${index}` : "";
  const attributes = [
    { trait_type: "Economic Rarity", value: share.economicRarity },
    ...(marketAsset ? [{ trait_type: "Market", value: marketAsset }] : []),
    ...(marketContract ? [{ trait_type: "PreStocks Mint", value: marketContract }] : []),
    ...(Number.isFinite(marketPrice) ? [{ trait_type: "PreStocks Reference Price", value: `$${marketPrice.toFixed(2)}` }] : []),
    ...(marketAsset ? [{ trait_type: "Market Source", value: "PreStocks" }] : []),
    ...Object.entries(share.attrs).map(([trait_type, value]) => ({
      trait_type,
      value,
    })),
  ];
  return NextResponse.json(
    {
      name: marketAsset ? `Canopy ${marketAsset} Claim` : `Canopy ${share.economicRarity} Share`,
      symbol: "CANOPY",
      description:
        marketAsset
          ? `A Canopy collectible linked to the ${marketAsset} PreStocks token. This devnet demo uses mock mUSDC.`
          : "A Canopy collectible linked to a mock mUSDC vault on Solana devnet.",
      image: share.seedStr ? `${origin}/api/cards/${mint}/image${qs}` : undefined,
      external_url: `${origin}/share/${mint}${qs}`,
      attributes,
      properties: { category: "image" },
    },
    { headers: { "Cache-Control": "public, max-age=60" } }
  );
}
