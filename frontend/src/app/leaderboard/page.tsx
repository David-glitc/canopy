import XPLeaderboard from "@/components/XPLeaderboard";

export const metadata = {
  title: "XP Leaderboard",
  description: "Rank Canopy collectors by their on-chain vault activity.",
};

export default function LeaderboardPage() {
  return (
    <div className="shell pb-24 pt-12 sm:pt-20">
      <XPLeaderboard />
    </div>
  );
}
