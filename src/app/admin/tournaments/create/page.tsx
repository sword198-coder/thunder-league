"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTournamentAction } from "@/lib/actions/adminActions";
import type { Tournament } from "@/types";

export default function CreateTournament() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [tier, setTier] = useState("Mid");
  const [status, setStatus] = useState<Tournament["status"]>("CREATED");
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !startDate || !endDate) {
      setError("Name, start date, and end date are required");
      return;
    }
    setSubmitting(true);
    setError("");

    const result = await createTournamentAction({
      name: name.trim(),
      tier: tier as Tournament["tier"],
      status,
      maxPlayers: parseInt(maxPlayers, 10) || 8,
      startDate,
      endDate,
      description: description.trim(),
      prize_pool: prizePool.trim(),
      registration_deadline: registrationDeadline || null,
      rules: rules.trim(),
      game: game.trim() || "War Thunder",
    });

    if (result.success) {
      router.push("/admin/tournaments");
    } else {
      setError(result.error || "Failed to create tournament");
    }
    setSubmitting(false);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Create Tournament</h1>
        <p className="text-primary/60 mt-1">Set up a new tournament</p>
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
            placeholder="e.g. Thunder Strike Cup"
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
            <label className="block text-sm font-medium text-primary/60 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Tournament["status"])}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
            >
              <option value="CREATED">Created</option>
              <option value="OPEN">Open</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
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
            placeholder="War Thunder"
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
            placeholder="Tournament description..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-primary/60 mb-1">Rules</label>
          <textarea
            value={rules}
            onChange={(e) => setRules(e.target.value)}
            rows={4}
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
            placeholder="Tournament rules..."
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-secondary text-white text-sm font-medium hover:bg-secondary/90 disabled:opacity-50 shadow-sm"
          >
            {submitting ? "Creating..." : "Create Tournament"}
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
