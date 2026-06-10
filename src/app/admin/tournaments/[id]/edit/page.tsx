"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchTournaments } from "@/lib/services/tournamentService";
import { updateTournamentAction } from "@/lib/actions/adminActions";
import type { Tournament } from "@/types";

export default function EditTournament() {
  const router = useRouter();
  const params = useParams();

  const [name, setName] = useState("");
  const [tier, setTier] = useState("Mid");
  const [maxPlayers, setMaxPlayers] = useState("8");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [prizePool, setPrizePool] = useState("");
  const [rules, setRules] = useState("");
  const [registrationDeadline, setRegistrationDeadline] = useState("");
  const [game, setGame] = useState("War Thunder");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadTournament();
  }, []);

  async function loadTournament() {
    const data = await fetchTournaments();
    const t = data.find((t: Tournament) => t.id === params.id);
    if (!t) { router.push("/admin/tournaments"); return; }
    setName(t.name);
    setTier(t.tier);
    setMaxPlayers(String(t.maxPlayers));
    setStartDate(t.startDate);
    setEndDate(t.endDate);
    setDescription(t.description);
    setPrizePool(t.prize_pool);
    setRules(t.rules);
    setRegistrationDeadline(t.registration_deadline ?? "");
    setGame(t.game);
    setLoaded(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !startDate || !endDate) {
      setError("Name, start date, and end date are required");
      return;
    }
    setSubmitting(true);
    setError("");

    const result = await updateTournamentAction(params.id as string, {
      name: name.trim(),
      tier: tier as Tournament["tier"],
      current_players: 0,
      max_players: parseInt(maxPlayers, 10) || 8,
      start_date: startDate,
      end_date: endDate,
      description: description.trim(),
      prize_pool: prizePool.trim(),
      rules: rules.trim(),
      registration_deadline: registrationDeadline || null,
      game: game.trim() || "War Thunder",
    });

    if (result.success) {
      router.push("/admin/tournaments");
    } else {
      setError(result.error || "Failed to update tournament");
    }
    setSubmitting(false);
  }

  if (!loaded) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-pulse text-primary/40 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Edit Tournament</h1>
        <p className="text-primary/60 mt-1">Update tournament details</p>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-primary/60 mb-1">Tournament Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-primary/60 mb-1">Tier</label>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
            >
              <option value="Top">Top</option>
              <option value="High">High</option>
              <option value="Mid">Mid</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary/60 mb-1">Max Players</label>
            <input
              type="number"
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(e.target.value)}
              min={2}
              max={64}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-primary/60 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary/60 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-primary/60 mb-1">Registration Deadline</label>
          <input
            type="date"
            value={registrationDeadline}
            onChange={(e) => setRegistrationDeadline(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-primary/60 mb-1">Game</label>
          <input
            type="text"
            value={game}
            onChange={(e) => setGame(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-primary/60 mb-1">Prize Pool</label>
          <input
            type="text"
            value={prizePool}
            onChange={(e) => setPrizePool(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
            placeholder="e.g. $1,000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-primary/60 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-primary/60 mb-1">Rules</label>
          <textarea
            value={rules}
            onChange={(e) => setRules(e.target.value)}
            rows={4}
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-secondary text-white text-sm font-medium hover:bg-secondary/90 disabled:opacity-50 shadow-sm"
          >
            {submitting ? "Saving..." : "Save Changes"}
          </button>
          <a
            href="/admin/tournaments"
            className="px-6 py-2.5 rounded-xl border border-border text-primary text-sm font-medium hover:bg-surface transition-colors"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
