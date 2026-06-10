"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/supabase/session-provider";
import { fetchTournaments } from "@/lib/services/tournamentService";
import { deleteTournamentAction, updateTournamentStatusAction } from "@/lib/actions/adminActions";
import type { Tournament } from "@/types";

export default function AdminTournaments() {
  const { user, loading } = useSession();
  const router = useRouter();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/login"); return; }
    loadTournaments();
  }, [user, loading, router]);

  async function loadTournaments() {
    const data = await fetchTournaments();
    setTournaments(data);
    setPageLoading(false);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    const result = await deleteTournamentAction(id, name);
    if (result.success) {
      setTournaments((prev) => prev.filter((t) => t.id !== id));
    } else {
      alert(result.error || "Failed to delete");
    }
  }

  async function handleStatus(id: string, status: string) {
    const result = await updateTournamentStatusAction(id, status);
    if (result.success) loadTournaments();
  }

  if (loading || pageLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-pulse text-primary/40 text-sm">Loading...</div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    CREATED: "bg-slate-100 text-slate-700",
    OPEN: "bg-emerald-100 text-emerald-700",
    FULL: "bg-blue-100 text-blue-700",
    ACTIVE: "bg-amber-100 text-amber-700",
    COMPLETED: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary">Tournament Management</h1>
          <p className="text-primary/60 mt-1">Create, edit, and manage tournaments</p>
        </div>
        <a
          href="/admin/tournaments/create"
          className="px-4 py-2.5 rounded-xl bg-secondary text-white text-sm font-medium hover:bg-secondary/90 shadow-sm"
        >
          + Create Tournament
        </a>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface border-b border-border">
              <th className="px-4 py-3 text-left font-semibold text-primary/60 text-xs uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-primary/60 text-xs uppercase tracking-wider">Tier</th>
              <th className="px-4 py-3 text-center font-semibold text-primary/60 text-xs uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-center font-semibold text-primary/60 text-xs uppercase tracking-wider">Players</th>
              <th className="px-4 py-3 text-left font-semibold text-primary/60 text-xs uppercase tracking-wider">Dates</th>
              <th className="px-4 py-3 text-right font-semibold text-primary/60 text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tournaments.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-primary/40">No tournaments found</td>
              </tr>
            )}
            {tournaments.map((t) => (
              <tr key={t.id} className="hover:bg-surface/50 transition-colors">
                <td className="px-4 py-3 font-medium text-primary">{t.name}</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary/70">{t.tier}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[t.status] ?? "bg-slate-100 text-slate-700"}`}>
                    {t.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-primary/70">{t.currentPlayers}/{t.maxPlayers}</td>
                <td className="px-4 py-3 text-primary/60 text-xs">{t.startDate} — {t.endDate}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <select
                      value={t.status}
                      onChange={(e) => handleStatus(t.id, e.target.value)}
                      className="text-xs px-2 py-1 rounded border border-border bg-white text-primary"
                    >
                      <option value="CREATED">Created</option>
                      <option value="OPEN">Open</option>
                      <option value="FULL">Full</option>
                      <option value="ACTIVE">Active</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                    <a
                      href={`/admin/tournaments/${t.id}/bracket`}
                      className="text-xs px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      Bracket
                    </a>
                    <a
                      href={`/admin/tournaments/${t.id}/edit`}
                      className="text-xs px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      Edit
                    </a>
                    <button
                      onClick={() => handleDelete(t.id, t.name)}
                      className="text-xs px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
