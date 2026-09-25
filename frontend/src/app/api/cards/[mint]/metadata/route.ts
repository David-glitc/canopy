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
  const marketAsset = req.nextUrl.searchParams.get("asset")?.slice(0, 24).toUpperCase() ?? share.position?.symbol;
  const marketContract = req.nextUrl.searchParams.get("contract")?.slice(0, 64) ?? share.position?.mint;
  const rawMarketPrice = Number(req.nextUrl.searchParams.get("price"));
  const marketPrice = Number.isFinite(rawMarketPrice) && rawMarketPrice > 0 ? rawMarketPrice : share.position?.referencePrice;
  const marketSource = req.nextUrl.searchParams.get("source") === "xStocks" || share.position?.source === "xStocks" ? "xStocks" : "PreStocks";
  const origin = req.nextUrl.origin;
  const qs = grove && index ? `?grove=${grove}&index=${index}` : "";
  const attributes = [
    { trait_type: "Economic Rarity", value: share.economicRarity },
    { trait_type: "Assembly", value: "Runtime Digital Matter" },
    ...(share.matterDna ? [{ trait_type: "Digital Matter DNA", value: share.matterDna }] : []),
    ...share.matterTraits.filter((trait) => trait.trait_type !== "Economic Rarity"),
    ...(marketAsset ? [{ trait_type: "Market", value: marketAsset }] : []),
    ...(marketContract ? [{ trait_type: `${marketSource} Mint`, value: marketContract }] : []),
    ...(typeof marketPrice === "number" && Number.isFinite(marketPrice) ? [{ trait_type: `${marketSource} Reference Price`, value: `$${marketPrice.toFixed(2)}` }] : []),
    ...(marketAsset ? [{ trait_type: "Market Source", value: marketSource }] : []),
    ...(marketAsset ? [{ trait_type: "Target Allocation", value: `${marketAsset} 100%` }] : []),
    { trait_type: "Vault Asset", value: "mUSDC" },
    { trait_type: "Swap Status", value: "Not executed" },
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
          ? `Runtime-assembled Digital Matter with ${marketAsset} encoded as its market target and mUSDC held in its vault. Its form is generated from verifiable position DNA.`
          : "Runtime-assembled Digital Matter generated from a Canopy vault position and reveal DNA.",
      image: share.seedStr ? `${origin}/api/cards/${mint}/image${qs}` : undefined,
      external_url: `${origin}/share/${mint}${req.nextUrl.search}`,
      attributes,
      properties: { category: "image" },
    },
    { headers: { "Cache-Control": "public, max-age=60" } }
  );
}
