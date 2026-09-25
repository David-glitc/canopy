import SectorList from "@/components/SectorList";

export const metadata = {
  title: "Group Vaults",
  description: "Pool positions, mint one collectible per deposit, and reveal together.",
};

export default function SectorsPage() {
  return (
    <div className="shell pb-24 pt-10 sm:pt-16">
      <div className="vault-page-head">
        <div>
          <p className="page-kicker">Group vaults</p>
          <h1 className="page-title">Build the position together.</h1>
        </div>
        <p className="page-lede">
          Fund a 2–5 token stock set. Mint sealed. Reveal a non-zero claim on the vault.
        </p>
      </div>
      <div className="mt-10">
        <SectorList />
      </div>
    </div>
  );
}
