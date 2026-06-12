"use client";

import { useState, useCallback } from "react";
import type { Tournament, DrawBotStep, NotificationEvent } from "@/types";
import { defaultTournaments } from "@/data/tournaments";
import { initializeTournaments, processJoinRequest } from "@/lib/tournamentManager";
import { useSession } from "@/lib/supabase/session-provider";
import { logger } from "@/lib/logger";
import TournamentSchedule from "@/components/TournamentSchedule";
import TournamentCard from "@/components/TournamentCard";
import BracketView from "@/components/BracketView";
import DrawBotAnimation from "@/components/DrawBotAnimation";

const tierBadge: Record<string, string> = {
  Top: "bg-gradient-to-r from-amber-400 to-yellow-500",
  High: "bg-gradient-to-r from-slate-300 to-slate-400",
  Mid: "bg-gradient-to-r from-blue-400 to-blue-500",
  Low: "bg-gradient-to-r from-emerald-400 to-green-500",
};

export default function TournamentsPage() {
  const { user, loading } = useSession();

  const [tournaments, setTournaments] = useState<Tournament[]>(() =>
    initializeTournaments(defaultTournaments)
  );
  const [drawBotTournamentId, setDrawBotTournamentId] = useState<string | null>(null);
  const [drawBotSteps, setDrawBotSteps] = useState<DrawBotStep[]>([]);
  const [notifications, setNotifications] = useState<NotificationEvent[]>([]);

  const handleJoin = useCallback(() => {
    const result = processJoinRequest({ playerName: "CurrentPlayer" });
    setTournaments(result.tournaments);
    logger.info("Player joined tournament", { tournament: result.tournament.name });

    if (result.drawBotSteps) {
      setDrawBotSteps(result.drawBotSteps);
      setDrawBotTournamentId(result.tournament.id);
    }
    if (result.notifications.length > 0) {
      setNotifications((prev) => [...prev, ...result.notifications]);
    }
  }, []);

  const handleDrawBotComplete = useCallback(() => {
    setDrawBotTournamentId(null);
    setDrawBotSteps([]);
  }, []);

  if (loading || !user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-pulse text-primary/40 text-sm">Loading...</div>
      </div>
    );
  }

  const active = tournaments.filter((t) => t.status === "ACTIVE" || t.status === "FULL");
  const upcoming = tournaments.filter((t) => t.status === "OPEN" || t.status === "CREATED");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-14">
      {notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map((n, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-800">
              <span className="text-lg">
                {n.type === "tournament_full" ? "🔒" : n.type === "bracket_generated" ? "📋" : "📢"}
              </span>
              <span className="flex-1">{n.message}</span>
              <button
                onClick={() => setNotifications((prev) => prev.filter((_, j) => j !== i))}
                className="text-blue-400 hover:text-blue-600 text-lg leading-none"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <section>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-2">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight">Tournaments</h1>
            <p className="text-primary/50 mt-1 text-sm">Compete across divisions and climb to the top</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-primary/40">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Active Season</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent" /> Live Now</span>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-primary">Monthly Tournament Schedule</h2>
          <span className="text-[11px] font-medium text-primary/40">Season 3 — July 2026</span>
        </div>
        <TournamentSchedule />
      </section>

      <section>
        <div className="flex items-center gap-2 mb-5">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <h2 className="text-lg font-bold text-primary">Active Tournaments</h2>
        </div>
        {active.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface/50 p-10 text-center">
            <p className="text-primary/40 text-sm">No active tournaments right now.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {active.map((t) => (
              <div key={t.id} className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-slate-50 to-white border-b border-border">
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="hidden sm:flex w-12 h-12 rounded-xl bg-primary/5 items-center justify-center">
                          <span className="text-xl">🏆</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded text-white ${tierBadge[t.tier]}`}>
                              {t.tier} TIER
                            </span>
                            <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                              {t.status === "ACTIVE" ? "Live" : "Full"}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-primary">{t.name}</h3>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 sm:gap-6 text-xs">
                        <div><span className="text-primary/40 block">Players</span><span className="font-semibold text-primary">{t.currentPlayers}/{t.maxPlayers}</span></div>
                        <div><span className="text-primary/40 block">Starts</span><span className="font-semibold text-primary">{t.startDate}</span></div>
                      </div>
                    </div>
                  </div>
                </div>

                {t.bracket && <BracketView matches={t.bracket} />}

                <div className="px-5 sm:px-6 py-3 bg-gradient-to-r from-slate-50 to-white border-t border-border">
                  <div className="flex items-center justify-between text-[11px] text-primary/40">
                    <span>Registration: <span className="font-medium text-primary/60">Closed</span></span>
                    <span>Countdown: <span className="font-medium text-primary/60">In Progress</span></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {drawBotTournamentId && drawBotSteps.length > 0 && (
          <div className="mt-6 max-w-md">
            <DrawBotAnimation steps={drawBotSteps} onComplete={handleDrawBotComplete} />
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-bold text-primary mb-5">
          Open Tournaments
          {upcoming.length > 0 && (
            <span className="ml-2 text-[11px] font-medium text-primary/40">({upcoming.length} available)</span>
          )}
        </h2>
        {upcoming.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface/50 p-10 text-center">
            <p className="text-primary/40 text-sm">No open tournaments. New ones will be created automatically.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {upcoming.map((t) => (
              <TournamentCard key={t.id} tournament={t} onJoin={handleJoin} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
