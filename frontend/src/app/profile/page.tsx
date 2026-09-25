import PortfolioProfile from "@/components/PortfolioProfile";

export const metadata = {
  title: "Profile & Inventory",
  description: "Manage your Canopy instant mints, vault shares, and Digital Matter.",
};

export default function ProfilePage() {
  return (
    <div className="shell pb-24 pt-10 sm:pt-16">
      <PortfolioProfile />
    </div>
  );
}
