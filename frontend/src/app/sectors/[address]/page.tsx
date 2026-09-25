import SectorDetail from "@/components/SectorDetail";
import Link from "next/link";

export const metadata = {
  title: "Group Vault",
};

export default async function SectorPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = await params;
  return (
    <div className="shell pb-24 pt-16 sm:pt-24">
      <Link href="/sectors" className="font-mono2 text-sm text-[var(--canopy-muted)] no-underline transition-colors hover:text-[var(--canopy-text)]">
        ← Vault terminal
      </Link>
      <div className="mt-4">
        <SectorDetail address={address} />
      </div>
    </div>
  );
}
