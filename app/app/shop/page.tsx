import Link from "next/link";
import { fetchShare, type ShareData } from "@/lib/card-data";

export const metadata = {
  title: "Shop — Canopy",
  description: "Trade cipher-keys. History compounds on-chain.",
};

const DEMO_MINTERS = [
  "9xmniHhMGswjyMGf9jW7YCireJaUARBozRSDWYU1Jrnf",
  "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d",
];

export default async function ShopPage() {
  const shares = await Promise.allSettled(
    DEMO_MINTERS.map((m) => fetchShare(m))
  );
  const revealed = shares
    .filter((s): s is PromiseFulfilledResult<ShareData> => s.status === "fulfilled" && s.value !== null)
    .map((s) => s.value as ShareData);

  return (
    <div className="mx-auto max-w-6xl px-6 pb-24 pt-28">
      <p className="font-mono2 text-xs tracking-[0.3em] text-[var(--canopy-purple)]">
        03 / SHOP
      </p>
      <h1 className="font-display mt-3 text-4xl font-extrabold sm:text-5xl">
        Trade cipher-keys.
      </h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-[var(--canopy-muted)]">
        Revealed Shares trade with their claim attached. History compounds
        on-chain — crash survivors and cold-storage keys carry their scars
        in the open.
      </p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {revealed.length === 0 ? (
          <p className="font-mono2 text-sm text-[var(--canopy-muted)]">
            No revealed shares available yet. Fund a Sector to mint one.
          </p>
        ) : (
          revealed.map((share) => (
            <Link
              key={share.mint}
              href={`/share/${share.mint}`}
              className="glass overflow-hidden rounded-2xl transition-hover hover:scale-[1.02]"
            >
              <div className="aspect-[2/3] relative overflow-hidden bg-[radial-gradient(ellipse_at_50%_40%,#12261c_0%,#050505_70%)]">
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
                    <p className="font-mono2 text-xs tracking-[0.4em] text-[var(--canopy-green)]">SEALED</p>
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="font-display text-sm font-bold text-[var(--canopy-text)]">
                  {share.name}
                </p>
                <p className="mt-1 font-mono2 text-[11px] text-[var(--canopy-muted)]">
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
