import SectorList from "@/components/SectorList";

export const metadata = {
  title: "Group Vaults",
  description: "Pool mock funds, mint one collectible per deposit, and refund failed goals.",
};

export default function SectorsPage() {
  return (
    <div className="shell pb-24 pt-16 sm:pt-24">
      <p className="page-kicker">Group vaults</p>
      <h1 className="page-title">Pool a pick together.</h1>
      <p className="page-lede">
        Each group vault has a goal and deadline. Every deposit mints a collectible. If the vault
        misses its goal, depositors can take their mock funds back.
      </p>
      <div className="mt-14">
        <SectorList />
      </div>
    </div>
  );
}
