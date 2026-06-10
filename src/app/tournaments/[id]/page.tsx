"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/supabase/session-provider";
import { fetchTournamentById } from "@/lib/services/tournamentService";
import { registerForTournament, fetchMyRegistrations, fetchTournamentRegistrations } from "@/lib/services/registrationService";
import { updateRegistrationStatusAction } from "@/lib/actions/adminActions";
import type { Tournament, TournamentRegistration } from "@/types";

const tierColors: Record<string, string> = {
  Top: "from-amber-500 to-yellow-600",
  High: "from-blue-500 to-sky-600",
  Mid: "from-purple-500 to-violet-600",
  Low: "from-slate-500 to-gray-600",
};

const statusLabel: Record<string, string> = {
  CREATED: "Created", OPEN: "Registration Open", FULL: "Full",
  ACTIVE: "In Progress", COMPLETED: "Completed",
};

const statusStyle: Record<string, string> = {
  CREATED: "bg-slate-100 text-slate-700", OPEN: "bg-emerald-100 text-emerald-700",
  FULL: "bg-amber-100 text-amber-700", ACTIVE: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-purple-100 text-purple-700",
};

export default function TournamentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useSession();

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [registrations, setRegistrations] = useState<TournamentRegistration[]>([]);
  const [myReg, setMyReg] = useState<TournamentRegistration | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [countdown, setCountdown] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [allRegs, setAllRegs] = useState<TournamentRegistration[]>([]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/login"); return; }
    loadData();
  }, [user, authLoading, params.id]);

  async function loadData() {
    const t = await fetchTournamentById(params.id as string);
    if (!t) { setPageLoading(false); return; }
    setTournament(t);

    const regs = await fetchMyRegistrations(user!.id);
    setRegistrations(regs);
    const mine = regs.find((r) => r.tournament_id === t.id) ?? null;
    setMyReg(mine);

    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single();
    const admin = profile?.role === "admin" || profile?.role === "super_admin";
    setIsAdmin(admin);

    if (admin) {
      const all = await fetchTournamentRegistrations(t.id);
      setAllRegs(all);
    }

    setPageLoading(false);
  }

  useEffect(() => {
    if (!tournament?.startDate) return;
    const target = new Date(tournament.startDate).getTime();
    function tick() {
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) { setCountdown("Started"); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setCountdown(`${d}d ${h}h ${m}m`);
    }
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, [tournament?.startDate]);

  async function handleJoin() {
    if (!tournament || !user) return;
    setJoining(true);
    setMessage("");
    const result = await registerForTournament(user.id, tournament.id);
    if (result.success) {
      setMessageType("success");
      setMessage("Registered successfully!");
      loadData();
    } else {
      setMessageType("error");
      setMessage(result.error || "Failed to register");
    }
    setJoining(false);
    setTimeout(() => setMessage(""), 4000);
  }

  if (authLoading || pageLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-pulse text-primary/40 text-sm">Loading...</div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-primary/40 mb-4">Tournament not found</p>
          <button onClick={() => router.push("/tournaments")} className="text-sm text-secondary hover:underline">Back to tournaments</button>
        </div>
      </div>
    );
  }

  const canJoin = tournament.status === "OPEN" && !myReg && tournament.currentPlayers < tournament.maxPlayers;
  const canLeave = myReg && myReg.status === "pending";
  const slotsRemaining = tournament.maxPlayers - tournament.currentPlayers;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => router.push("/tournaments")} className="text-sm text-primary/40 hover:text-primary/60 mb-4 transition-colors">
        ← Back to Tournaments
      </button>

      {tournament.banner_url && (
        <div className="rounded-xl overflow-hidden mb-6 aspect-[3/1] bg-surface">
          <img src={tournament.banner_url} alt={tournament.name} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded text-white bg-gradient-to-r ${tierColors[tournament.tier] ?? tierColors.Low}`}>
              {tournament.tier} TIER
            </span>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyle[tournament.status]}`}>
              {statusLabel[tournament.status]}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-primary">{tournament.name}</h1>
          <p className="text-primary/50 text-sm mt-1">{tournament.game}</p>
        </div>

        <div className="text-right text-sm text-primary/60">
          <p>{tournament.startDate} — {tournament.endDate}</p>
          {countdown && <p className="text-xs text-secondary font-medium mt-1">Starts in {countdown}</p>}
        </div>
      </div>

      {message && (
        <div className={`mb-6 px-4 py-3 rounded-xl text-sm ${
          messageType === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-800" : "bg-red-50 border border-red-200 text-red-800"
        }`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <div className="lg:col-span-2 space-y-6">
          {tournament.description && (
            <section className="rounded-xl border border-border bg-white shadow-sm p-6">
              <h2 className="text-lg font-bold text-primary mb-3">About</h2>
              <p className="text-sm text-primary/70 leading-relaxed whitespace-pre-wrap">{tournament.description}</p>
            </section>
          )}

          {tournament.rules && (
            <section className="rounded-xl border border-border bg-white shadow-sm p-6">
              <h2 className="text-lg font-bold text-primary mb-3">Rules</h2>
              <div className="text-sm text-primary/70 leading-relaxed whitespace-pre-wrap">{tournament.rules}</div>
            </section>
          )}
        </div>

        <div className="space-y-4">
          <section className="rounded-xl border border-border bg-white shadow-sm p-5">
            <h3 className="text-sm font-bold text-primary mb-3">Details</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-primary/50">Prize Pool</span>
                <span className="font-semibold text-primary">{tournament.prize_pool || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-primary/50">Players</span>
                <span className="font-semibold text-primary">{tournament.currentPlayers}/{tournament.maxPlayers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-primary/50">Available</span>
                <span className="font-semibold text-primary">{slotsRemaining}</span>
              </div>
              {tournament.registration_deadline && (
                <div className="flex justify-between">
                  <span className="text-primary/50">Reg. Deadline</span>
                  <span className="font-semibold text-primary">{tournament.registration_deadline}</span>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-white shadow-sm p-5">
            <h3 className="text-sm font-bold text-primary mb-3">Registration</h3>
            {myReg ? (
              <div className="text-center">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 mb-2">
                  {myReg.status === "pending" ? "Pending Approval" : myReg.status === "approved" ? "Approved" : "Rejected"}
                </span>
                {canLeave && (
                  <button className="w-full mt-2 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors">
                    Leave Tournament
                  </button>
                )}
              </div>
            ) : canJoin ? (
              <button
                onClick={handleJoin}
                disabled={joining}
                className="w-full py-2.5 rounded-lg bg-secondary text-white text-sm font-medium hover:bg-secondary/90 disabled:opacity-50 shadow-sm"
              >
                {joining ? "Registering..." : "Join Tournament"}
              </button>
            ) : tournament.status === "FULL" ? (
              <p className="text-sm text-primary/40 text-center">Tournament is full</p>
            ) : tournament.status === "ACTIVE" || tournament.status === "COMPLETED" ? (
              <p className="text-sm text-primary/40 text-center">Registration closed</p>
            ) : null}
          </section>
        </div>
      </div>

      <section className="rounded-xl border border-border bg-white shadow-sm p-6">
        <h2 className="text-lg font-bold text-primary mb-4">Registered Players ({tournament.currentPlayers})</h2>
        {(isAdmin ? allRegs : registrations).length === 0 ? (
          <p className="text-sm text-primary/40">No players registered yet.</p>
        ) : (
          <div className="space-y-2">
            {(isAdmin ? allRegs : registrations).map((r) => (
              <div key={r.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-surface/50">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary/40">
                  {r.user_id.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-primary">{r.user_id.slice(0, 8)}...</p>
                  <p className="text-xs text-primary/40">{new Date(r.registered_at).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  r.status === "approved" ? "bg-emerald-100 text-emerald-700" :
                  r.status === "rejected" ? "bg-red-100 text-red-700" :
                  "bg-amber-100 text-amber-700"
                }`}>
                  {r.status}
                </span>
                {isAdmin && r.status === "pending" && (
                  <div className="flex gap-1">
                    <button
                      onClick={async () => {
                        await updateRegistrationStatusAction(r.id, "approved", tournament!.id);
                        loadData();
                      }}
                      className="text-xs px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    >
                      Approve
                    </button>
                    <button
                      onClick={async () => {
                        await updateRegistrationStatusAction(r.id, "rejected", tournament!.id);
                        loadData();
                      }}
                      className="text-xs px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
