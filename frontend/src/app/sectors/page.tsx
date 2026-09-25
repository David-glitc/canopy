import SectorList from "@/components/SectorList";

export const metadata = {
  title: "Sectors",
  description: "Funding cells for tokenized equity. Back one, pull a cipher.",
};

export default function SectorsPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 pb-24 pt-28">
      <p className="font-mono2 text-sm tracking-[0.3em] text-[var(--canopy-green)]">
        01 / SECTORS
      </p>
      <h1 className="font-display mt-3 text-4xl font-extrabold sm:text-5xl">
        Funding cells.
      </h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-[var(--canopy-muted)]">
        Every Sector pools capital into real backing. Fund one to mint a sealed
        Share; when it closes, the draw assigns your cut — then owners govern
        it by market.
      </p>
      <div className="mt-10">
        <SectorList />
      </div>
    </div>
  );
}
