import SectorList from "@/components/SectorList";

export const metadata = {
  title: "Group Vaults",
  description: "Pool positions, mint one collectible per deposit, and reveal together.",
};

export default function SectorsPage() {
  return (
    <div className="shell pb-24 pt-8 sm:pt-12">
      <div className="vault-page-head">
        <div>
          <p className="page-kicker">Vaults</p>
          <h1 className="page-title">Fund a stock basket.</h1>
        </div>
        <p className="page-lede">
          Create or join a live USDC funding cycle.
        </p>
      </div>
      <div className="mt-6">
        <SectorList />
      </div>
    </div>
  );
}
