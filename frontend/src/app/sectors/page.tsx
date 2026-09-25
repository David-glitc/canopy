import SectorList from "@/components/SectorList";

export const metadata = {
  title: "Group Vaults",
  description: "Pool mock funds, mint one collectible per deposit, and refund failed goals.",
};

export default function SectorsPage() {
  return (
    <div className="shell pb-24 pt-10 sm:pt-16">
      <div className="vault-page-head">
        <div>
          <p className="page-kicker">Group vaults</p>
          <h1 className="page-title">Pool conviction.<br />Collect the outcome.</h1>
        </div>
        <p className="page-lede">
          Fund a private-market pick together. Each contribution becomes a unique collectible
          with a live share of the vault and DNA assembled at reveal.
        </p>
      </div>
      <div className="mt-10">
        <SectorList />
      </div>
    </div>
  );
}
