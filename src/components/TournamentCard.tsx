"use client";

import type { Tournament } from "@/types";

const tierColors: Record<string, { bg: string; border: string; badge: string }> = {
  Top: { bg: "from-amber-50 to-yellow-50", border: "border-amber-200", badge: "bg-amber-500" },
  High: { bg: "from-blue-50 to-sky-50", border: "border-blue-200", badge: "bg-blue-500" },
  Mid: { bg: "from-purple-50 to-violet-50", border: "border-purple-200", badge: "bg-purple-500" },
  Low: { bg: "from-slate-50 to-gray-50", border: "border-slate-200", badge: "bg-slate-500" },
};

const statusLabel: Record<string, string> = {
  CREATED: "Created",
  OPEN: "Registration Open",
  FULL: "Full",
  ACTIVE: "In Progress",
  COMPLETED: "Completed",
};

const statusStyle: Record<string, string> = {
  CREATED: "bg-slate-50 text-slate-500 border-slate-200",
  OPEN: "bg-emerald-50 text-emerald-700 border-emerald-200",
  FULL: "bg-amber-50 text-amber-700 border-amber-200",
  ACTIVE: "bg-blue-50 text-blue-700 border-blue-200",
  COMPLETED: "bg-slate-50 text-slate-500 border-slate-200",
};

interface Props {
  tournament: Tournament;
  onJoin: (id: string) => void;
}

export default function TournamentCard({ tournament, onJoin }: Props) {
  const colors = tierColors[tournament.tier] ?? tierColors.Low;
  const slotsRemaining = tournament.maxPlayers - tournament.currentPlayers;
  const canJoin = tournament.status === "OPEN" && slotsRemaining > 0;

  return (
    <div className={`rounded-xl border ${colors.border} bg-gradient-to-br ${colors.bg} shadow-sm overflow-hidden`}>
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold text-white ${colors.badge} mb-2`}>
              {tournament.tier} Tier
            </span>
            <h3 className="font-bold text-primary text-lg">{tournament.name}</h3>
          </div>
          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${statusStyle[tournament.status]}`}>
            {statusLabel[tournament.status]}
          </span>
        </div>

        <div className="space-y-2 text-sm text-primary/70">
          <div className="flex justify-between">
            <span>Players</span>
            <span className="font-semibold text-primary">{tournament.currentPlayers}/{tournament.maxPlayers}</span>
          </div>
          {tournament.status === "OPEN" && (
            <div className="flex justify-between">
              <span>Slots Remaining</span>
              <span className="font-semibold text-primary">{slotsRemaining}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Start Date</span>
            <span className="font-semibold text-primary">{tournament.startDate}</span>
          </div>
          <div className="flex justify-between">
            <span>End Date</span>
            <span className="font-semibold text-primary">{tournament.endDate}</span>
          </div>
        </div>

        {canJoin && (
          <button
            onClick={() => onJoin(tournament.id)}
            className="mt-4 w-full py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Join Tournament
          </button>
        )}

        {tournament.status === "FULL" && (
          <div className="mt-4 w-full py-2 rounded-lg bg-slate-100 text-slate-400 text-sm font-medium text-center">
            Tournament Full
          </div>
        )}

        {tournament.status === "ACTIVE" && slotsRemaining === 0 && (
          <div className="mt-4 w-full py-2 rounded-lg bg-slate-100 text-slate-400 text-sm font-medium text-center">
            In Progress
          </div>
        )}
      </div>
    </div>
  );
}
