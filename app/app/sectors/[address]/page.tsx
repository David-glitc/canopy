import SectorDetail from "../../components/SectorDetail";

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
      <a href="/sectors" className="font-mono2 text-xs text-[var(--canopy-muted)] hover:text-[var(--canopy-text)]">
        ← all sectors
      </a>
      <div className="mt-4">
        <SectorDetail address={address} />
      </div>
    </div>
  );
}
