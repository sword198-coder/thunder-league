import type { Metadata } from "next";
import LeaderboardTable from "@/components/LeaderboardTable";
import { fetchLeaderboardServer } from "@/lib/services/leaderboardServer";

export const metadata: Metadata = {
  title: "Leaderboard — Thunder League",
  description: "Thunder League tournament rankings. See the top War Thunder players by kills, wins, and score.",
};

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const data = await fetchLeaderboardServer();

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Tournament Leaderboard</h1>
        <p className="text-primary/60 mt-1">Top players ranked by total points</p>
      </div>
      <LeaderboardTable data={data} />
    </section>
  );
}
