import Link from "next/link";
import { fetchShare, type ShareData } from "@/lib/card-data";

export const metadata = {
  title: "Gallery",
  description: "Browse revealed Canopy collectibles and their onchain traits.",
};

const FEATURED_ASSETS = [
  "9xmniHhMGswjyMGf9jW7YCireJaUARBozRSDWYU1Jrnf",
  "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d",
];

export default async function ShopPage() {
  const shares = await Promise.allSettled(
    FEATURED_ASSETS.map((m) => fetchShare(m))
  );
  const revealed = shares
    .filter((s): s is PromiseFulfilledResult<ShareData> => s.status === "fulfilled" && s.value !== null)
    .map((s) => s.value as ShareData);

  return (
    <div className="shell pb-24 pt-16 sm:pt-24">
      <p className="page-kicker">Gallery</p>
      <h1 className="page-title">Every reveal is singular.</h1>
      <p className="page-lede">Explore the artwork, traits, and position history behind each piece of Digital Matter.</p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {revealed.length === 0 ? (
          <div className="glass rounded-2xl p-6 sm:col-span-2 lg:col-span-3">
            <p className="font-semibold">No revealed collectibles yet.</p>
            <Link href="/instant" className="btn-primary mt-4">Mint the first one</Link>
          </div>
        ) : (
          revealed.map((share) => (
            <Link
              key={share.mint}
              href={`/share/${share.mint}`}
              className="glass overflow-hidden rounded-2xl transition-colors hover:border-[var(--canopy-green)]"
            >
              <div className="aspect-[2/3] relative overflow-hidden bg-[#0d0d10]">
                {share.seedStr ? (
                  <img
                    src={`/api/cards/${share.mint}/image`}
                    alt={share.name}
                    className="w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="font-mono2 text-xs font-semibold text-[var(--canopy-green)]">SEALED</p>
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="font-display text-sm font-bold text-[var(--canopy-text)]">
                  {share.name}
                </p>
                <p className="mt-1 font-mono2 text-sm tabular text-[var(--canopy-muted)]">
                  {share.economicRarity} · {share.mint.slice(0, 8)}…
                </p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
