import SectorDetail from "@/components/SectorDetail";
import Link from "next/link";

export const metadata = {
  title: "Sector — Canopy",
};

export default async function SectorPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = await params;
  return (
    <div className="mx-auto max-w-6xl px-6 pb-24 pt-28">
      <Link href="/sectors" className="font-mono2 text-sm text-[var(--canopy-muted)] no-underline transition-colors hover:text-[var(--canopy-text)]">
        ← all sectors
      </Link>
      <div className="mt-4">
        <SectorDetail address={address} />
      </div>
    </div>
  );
}
