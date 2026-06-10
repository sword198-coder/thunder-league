"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/supabase/session-provider";
import { fetchTournamentById } from "@/lib/services/tournamentService";
import { generateBracketAction, advanceWinnerAction } from "@/lib/actions/adminActions";
import type { Tournament } from "@/types";

interface MatchDisplay {
  id?: string;
  matchNumber: number;
  round: string;
  position: number;
  status: string;
  scheduledTime: string;
  player1: string | null;
  player2: string | null;
  winner: string | null;
}

const ROUND_LABELS: Record<string, string> = {
  R32: "Round of 32", R16: "Round of 16", QF: "Quarter Finals", SF: "Semi Finals", F: "Finals",
};

export default function AdminBracketPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useSession();
  const tournamentId = params.id as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [matches, setMatches] = useState<MatchDisplay[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState("");

  async function loadMatches() {
    try {
      const res = await fetch(`/api/matches?tournament_id=${tournamentId}`);
      const data = await res.json();
      setMatches(data.matches ?? []);
    } catch {
      setMatches([]);
    }
  }

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/login"); return; }
    (async () => {
      const t = await fetchTournamentById(tournamentId);
      setTournament(t);
      await loadMatches();
      setPageLoading(false);
    })();
  }, [user, authLoading]);

  async function handleGenerateBracket() {
    setGenerating(true);
    setMessage("");
    const result = await generateBracketAction(tournamentId);
    if (result.success) {
      setMessage("Bracket generated successfully!");
      await loadMatches();
    } else {
      setMessage(result.error || "Failed");
    }
    setGenerating(false);
  }

  async function handleAdvanceWinner(matchId: string, winnerName: string) {
    setMessage("");
    const result = await advanceWinnerAction(tournamentId, matchId, winnerName);
    if (result.success) {
      setMessage(`Winner: ${winnerName}`);
      await loadMatches();
    } else {
      setMessage(result.error || "Failed");
    }
  }

  if (authLoading || pageLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-pulse text-primary/40 text-sm">Loading...</div>
      </div>
    );
  }

  if (!tournament) {
    return <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center text-primary/40">Tournament not found</div>;
  }

  const rounds = [...new Set(matches.map((m) => m.round))].sort(
    (a, b) => ["R32", "R16", "QF", "SF", "F"].indexOf(a) - ["R32", "R16", "QF", "SF", "F"].indexOf(b)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <button onClick={() => router.push("/admin/tournaments")} className="text-sm text-primary/40 hover:text-primary/60 mb-2">
            ← Back to Tournaments
          </button>
          <h1 className="text-2xl font-bold text-primary">{tournament.name} — Bracket</h1>
          <p className="text-sm text-primary/50">{tournament.tier} Tier — {tournament.status}</p>
        </div>
        <button
          onClick={handleGenerateBracket}
          disabled={generating}
          className="px-4 py-2 rounded-xl bg-secondary text-white text-sm font-medium hover:bg-secondary/90 disabled:opacity-50 shadow-sm"
        >
          {generating ? "Generating..." : (matches.length > 0 ? "Regenerate Bracket" : "Generate Bracket")}
        </button>
      </div>

      {message && (
        <div className="mb-6 px-4 py-3 rounded-xl text-sm bg-blue-50 border border-blue-200 text-blue-800">{message}</div>
      )}

      {matches.length === 0 ? (
        <div className="text-center py-16 text-primary/40">
          <p className="text-lg mb-2">No bracket generated yet</p>
          <p className="text-sm">Approve players and click Generate Bracket to start the tournament</p>
        </div>
      ) : (
        <div className="space-y-8">
          {rounds.map((round) => (
            <section key={round} className="rounded-xl border border-border bg-white shadow-sm p-6">
              <h2 className="text-lg font-bold text-primary mb-4">{ROUND_LABELS[round] ?? round}</h2>
              <div className="grid gap-3">
                {matches.filter((m) => m.round === round).map((match) => (
                  <div key={match.matchNumber} className="flex items-center gap-4 px-4 py-3 rounded-lg bg-surface/50 border border-border">
                    <span className="text-xs font-bold text-primary/30 w-6">#{match.matchNumber}</span>
                    <div className="flex-1 grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
                      <div className={`px-3 py-2 rounded text-sm font-medium text-center ${
                        match.winner && match.winner === match.player1 ? "bg-emerald-100 text-emerald-700 ring-2 ring-emerald-400" :
                        match.player1 ? "bg-primary/5 text-primary" : "bg-primary/5 text-primary/30 italic"
                      }`}>
                        {match.player1 || "TBD"}
                      </div>
                      <span className="text-xs font-bold text-primary/20">VS</span>
                      <div className={`px-3 py-2 rounded text-sm font-medium text-center ${
                        match.winner && match.winner === match.player2 ? "bg-emerald-100 text-emerald-700 ring-2 ring-emerald-400" :
                        match.player2 ? "bg-primary/5 text-primary" : "bg-primary/5 text-primary/30 italic"
                      }`}>
                        {match.player2 || "TBD"}
                      </div>
                    </div>
                    <span className="text-xs text-primary/30 w-20 text-right">{match.scheduledTime}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      match.status === "Completed" ? "bg-emerald-100 text-emerald-700" :
                      match.status === "Ready" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"
                    }`}>{match.status}</span>
                    {match.status === "Ready" && match.player1 && match.player2 && match.id && (
                      <div className="flex gap-1">
                        <button onClick={() => handleAdvanceWinner(match.id!, match.player1!)}
                          className="text-xs px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
                          P1 Win
                        </button>
                        <button onClick={() => handleAdvanceWinner(match.id!, match.player2!)}
                          className="text-xs px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
                          P2 Win
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
