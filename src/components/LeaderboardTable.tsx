import type { LeaderboardEntry } from "@/types";

const rankColors: Record<number, string> = {
  1: "bg-amber-50 border-amber-300 text-amber-800",
  2: "bg-slate-50 border-slate-300 text-slate-700",
  3: "bg-orange-50 border-orange-300 text-orange-800",
};

const rankBadge: Record<number, string> = {
  1: "text-amber-500",
  2: "text-slate-400",
  3: "text-orange-500",
};

const countryFlags: Record<string, string> = {
  RU: "🇷🇺", US: "🇺🇸", DE: "🇩🇪", JP: "🇯🇵", GB: "🇬🇧",
  FR: "🇫🇷", CN: "🇨🇳", IT: "🇮🇹", SE: "🇸🇪", IL: "🇮🇱",
};

interface Props {
  data: LeaderboardEntry[];
}

export default function LeaderboardTable({ data }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-surface border-b border-border">
            <th className="px-4 py-3 text-left font-semibold text-primary/60 text-xs uppercase tracking-wider">Rank</th>
            <th className="px-4 py-3 text-left font-semibold text-primary/60 text-xs uppercase tracking-wider">Player</th>
            <th className="px-4 py-3 text-right font-semibold text-primary/60 text-xs uppercase tracking-wider">Kills</th>
            <th className="px-4 py-3 text-right font-semibold text-primary/60 text-xs uppercase tracking-wider">Wins</th>
            <th className="px-4 py-3 text-right font-semibold text-primary/60 text-xs uppercase tracking-wider">Score</th>
            <th className="px-4 py-3 text-center font-semibold text-primary/60 text-xs uppercase tracking-wider">Country</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((entry) => {
            const rowStyle = rankColors[entry.rank] ?? "border-transparent";
            const badge = rankBadge[entry.rank];
            return (
              <tr
                key={entry.rank}
                className={`transition-colors hover:bg-surface/80 ${entry.rank <= 3 ? rowStyle : ""}`}
              >
                <td className="px-4 py-3">
                  {entry.rank <= 3 ? (
                    <span className={`text-lg font-bold ${badge}`}>
                      {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : "🥉"}
                    </span>
                  ) : (
                    <span className="font-mono text-primary/50">#{entry.rank}</span>
                  )}
                </td>
                <td className="px-4 py-3 font-medium text-primary">{entry.playerName}</td>
                <td className="px-4 py-3 text-right font-mono text-primary/80">{entry.kills.toLocaleString()}</td>
                <td className="px-4 py-3 text-right font-mono text-primary/80">{entry.wins.toLocaleString()}</td>
                <td className="px-4 py-3 text-right font-mono font-semibold text-primary">{entry.score.toLocaleString()}</td>
                <td className="px-4 py-3 text-center text-lg">{countryFlags[entry.country] ?? entry.country}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
