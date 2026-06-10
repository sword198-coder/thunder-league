"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/supabase/session-provider";
import {
  fetchLeaderboard,
} from "@/lib/services/leaderboardService";
import {
  addLeaderboardEntryAction,
  updateLeaderboardEntryAction,
  deleteLeaderboardEntryAction,
} from "@/lib/actions/adminActions";
import type { LeaderboardEntry } from "@/types";

export default function AdminLeaderboard() {
  const { user, loading } = useSession();
  const router = useRouter();

  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formName, setFormName] = useState("");
  const [formTeam, setFormTeam] = useState("");
  const [formRank, setFormRank] = useState("");
  const [formPoints, setFormPoints] = useState("");
  const [formWins, setFormWins] = useState("");
  const [formLosses, setFormLosses] = useState("");
  const [formCountry, setFormCountry] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/login"); return; }
    loadEntries();
  }, [user, loading, router]);

  async function loadEntries() {
    const data = await fetchLeaderboard();
    setEntries(data);
    setPageLoading(false);
  }

  function resetForm() {
    setFormName("");
    setFormTeam("");
    setFormRank("");
    setFormPoints("");
    setFormWins("");
    setFormLosses("");
    setFormCountry("US");
  }

  function openAdd() {
    resetForm();
    setFormCountry("US");
    setShowAdd(true);
    setEditingId(null);
  }

  function openEdit(entry: LeaderboardEntry) {
    setFormName(entry.player_name);
    setFormTeam(entry.team_name);
    setFormRank(String(entry.rank));
    setFormPoints(String(entry.points));
    setFormWins(String(entry.wins));
    setFormLosses(String(entry.losses));
    setFormCountry(entry.country);
    setEditingId(entry.id);
    setShowAdd(true);
  }

  async function handleSave() {
    if (!formName.trim() || !formRank || !formPoints) return;
    setSaving(true);

    if (editingId) {
      const result = await updateLeaderboardEntryAction(editingId, {
        player_name: formName.trim(),
        team_name: formTeam.trim(),
        rank: parseInt(formRank, 10) || 0,
        points: parseInt(formPoints, 10) || 0,
        wins: parseInt(formWins, 10) || 0,
        losses: parseInt(formLosses, 10) || 0,
        country: formCountry || "US",
      });
      if (!result.success) alert(result.error || "Failed to update");
    } else {
      const result = await addLeaderboardEntryAction({
        player_name: formName.trim(),
        team_name: formTeam.trim(),
        rank: parseInt(formRank, 10) || 0,
        points: parseInt(formPoints, 10) || 0,
        wins: parseInt(formWins, 10) || 0,
        losses: parseInt(formLosses, 10) || 0,
        country: formCountry || "US",
      });
      if (!result.success) alert(result.error || "Failed to add");
    }

    setSaving(false);
    setShowAdd(false);
    setEditingId(null);
    loadEntries();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this leaderboard entry?")) return;
    const result = await deleteLeaderboardEntryAction(id);
    if (!result.success) alert(result.error || "Failed to delete");
    loadEntries();
  }

  async function handleMoveUp(entry: LeaderboardEntry, index: number) {
    if (index === 0) return;
    const above = entries[index - 1];
    await updateLeaderboardEntryAction(entry.id, { rank: above.rank });
    await updateLeaderboardEntryAction(above.id, { rank: entry.rank });
    loadEntries();
  }

  async function handleMoveDown(entry: LeaderboardEntry, index: number) {
    if (index === entries.length - 1) return;
    const below = entries[index + 1];
    await updateLeaderboardEntryAction(entry.id, { rank: below.rank });
    await updateLeaderboardEntryAction(below.id, { rank: entry.rank });
    loadEntries();
  }

  if (loading || pageLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-pulse text-primary/40 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary">Leaderboard Management</h1>
          <p className="text-primary/60 mt-1">Add, edit, and reorder leaderboard entries</p>
        </div>
        <button
          onClick={openAdd}
          className="px-4 py-2.5 rounded-xl bg-secondary text-white text-sm font-medium hover:bg-secondary/90 shadow-sm"
        >
          + Add Player
        </button>
      </div>

      {showAdd && (
        <div className="mb-6 rounded-xl border border-border bg-white shadow-sm p-6">
          <h3 className="text-lg font-bold text-primary mb-4">{editingId ? "Edit Player" : "Add Player"}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-primary/60 mb-1">Player Name</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-primary/60 mb-1">Team</label>
              <input
                type="text"
                value={formTeam}
                onChange={(e) => setFormTeam(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-primary/60 mb-1">Rank</label>
              <input
                type="number"
                value={formRank}
                onChange={(e) => setFormRank(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-primary/60 mb-1">Points</label>
              <input
                type="number"
                value={formPoints}
                onChange={(e) => setFormPoints(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-primary/60 mb-1">Wins</label>
              <input
                type="number"
                value={formWins}
                onChange={(e) => setFormWins(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-primary/60 mb-1">Losses</label>
              <input
                type="number"
                value={formLosses}
                onChange={(e) => setFormLosses(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-primary/60 mb-1">Country</label>
              <input
                type="text"
                value={formCountry}
                onChange={(e) => setFormCountry(e.target.value)}
                maxLength={2}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-secondary text-white text-sm font-medium hover:bg-secondary/90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => { setShowAdd(false); setEditingId(null); }}
              className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-surface"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface border-b border-border">
              <th className="px-4 py-3 text-left font-semibold text-primary/60 text-xs uppercase tracking-wider">Reorder</th>
              <th className="px-4 py-3 text-left font-semibold text-primary/60 text-xs uppercase tracking-wider">Rank</th>
              <th className="px-4 py-3 text-left font-semibold text-primary/60 text-xs uppercase tracking-wider">Player</th>
              <th className="px-4 py-3 text-left font-semibold text-primary/60 text-xs uppercase tracking-wider">Team</th>
              <th className="px-4 py-3 text-right font-semibold text-primary/60 text-xs uppercase tracking-wider">Points</th>
              <th className="px-4 py-3 text-right font-semibold text-primary/60 text-xs uppercase tracking-wider">W/L</th>
              <th className="px-4 py-3 text-center font-semibold text-primary/60 text-xs uppercase tracking-wider">Country</th>
              <th className="px-4 py-3 text-right font-semibold text-primary/60 text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {entries.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-primary/40">No leaderboard entries</td>
              </tr>
            )}
            {entries.map((entry, i) => (
              <tr key={entry.id} className="hover:bg-surface/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMoveUp(entry, i)}
                      disabled={i === 0}
                      className="p-1 rounded hover:bg-surface disabled:opacity-30"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => handleMoveDown(entry, i)}
                      disabled={i === entries.length - 1}
                      className="p-1 rounded hover:bg-surface disabled:opacity-30"
                    >
                      ▼
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-primary">{entry.rank}</td>
                <td className="px-4 py-3 font-medium text-primary">{entry.player_name}</td>
                <td className="px-4 py-3 text-primary/60">{entry.team_name}</td>
                <td className="px-4 py-3 text-right font-mono text-primary">{entry.points.toLocaleString()}</td>
                <td className="px-4 py-3 text-right font-mono text-primary/70">{entry.wins}/{entry.losses}</td>
                <td className="px-4 py-3 text-center text-sm text-primary/60">{entry.country}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEdit(entry)}
                      className="text-xs px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
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
