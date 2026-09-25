import Link from "next/link";
import PortfolioProfile from "@/components/PortfolioProfile";

export const metadata = {
  title: "Wallet Activity",
  description: "A public Canopy portfolio and its collection activity.",
};

export default async function PersonaPage({ params }: { params: Promise<{ addr: string }> }) {
  const { addr } = await params;
  return (
    <div className="shell pb-24 pt-10 sm:pt-16">
      <Link href="/people" className="font-mono2 text-sm text-[var(--canopy-muted)] no-underline transition-colors hover:text-[var(--canopy-text)]">
        ← back to wallets
      </Link>
      <div className="mt-4"><PortfolioProfile address={addr} /></div>
    </div>
  );
}
