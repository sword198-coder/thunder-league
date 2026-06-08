import type { Metadata } from "next";
import LeaderboardTable from "@/components/LeaderboardTable";
import { leaderboardData } from "@/data/leaderboard";

export const metadata: Metadata = {
  title: "Leaderboard — Thunder League",
  description: "Thunder League tournament rankings. See the top War Thunder players by kills, wins, and score.",
};

export default function LeaderboardPage() {
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Tournament Leaderboard</h1>
        <p className="text-primary/60 mt-1">Top 10 players ranked by total score</p>
      </div>
      <LeaderboardTable data={leaderboardData} />
    </section>
  );
}
