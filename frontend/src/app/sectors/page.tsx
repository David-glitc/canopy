import SectorList from "@/components/SectorList";

export const metadata = {
  title: "Group Vaults",
  description: "Pool mock funds, mint one collectible per deposit, and refund failed goals.",
};

export default function SectorsPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 pb-24 pt-28">
      <p className="page-kicker">Group demo</p>
      <h1 className="font-display mt-3 text-balance text-4xl font-extrabold sm:text-5xl">
        Pool mock funds with friends.
      </h1>
      <p className="mt-4 max-w-2xl text-pretty leading-relaxed text-[var(--canopy-muted)]">
        Each group vault has a goal and deadline. Every deposit mints a collectible. If the vault
        misses its goal, depositors can take their mock funds back.
      </p>
      <div className="mt-10">
        <SectorList />
      </div>
    </div>
  );
}
