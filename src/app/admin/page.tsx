"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/supabase/session-provider";
import { getAdminStats, getRecentActivity, isAdmin } from "@/lib/services/adminService";
import type { AdminStats, RecentActivity } from "@/types";

export default function AdminDashboard() {
  const { user, loading } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [adminLoading, setAdminLoading] = useState(true);
  const [adminVerified, setAdminVerified] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/login"); return; }

    isAdmin(user.id).then((ok) => {
      if (!ok) { router.push("/dashboard"); return; }
      setAdminVerified(true);

      Promise.all([
        getAdminStats(),
        getRecentActivity(),
      ]).then(([s, a]) => {
        setStats(s);
        setActivities(a);
        setAdminLoading(false);
      });
    });
  }, [user, loading, router]);

  if (loading || adminLoading || !adminVerified) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-pulse text-primary/40 text-sm">Loading...</div>
      </div>
    );
  }

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers ?? 0, color: "bg-blue-50 border-blue-200 text-blue-800" },
    { label: "Total Tournaments", value: stats?.totalTournaments ?? 0, color: "bg-purple-50 border-purple-200 text-purple-800" },
    { label: "Active Tournaments", value: stats?.activeTournaments ?? 0, color: "bg-emerald-50 border-emerald-200 text-emerald-800" },
    { label: "Upcoming Tournaments", value: stats?.upcomingTournaments ?? 0, color: "bg-amber-50 border-amber-200 text-amber-800" },
    { label: "Leaderboard Entries", value: stats?.leaderboardEntries ?? 0, color: "bg-rose-50 border-rose-200 text-rose-800" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
        <p className="text-primary/60 mt-1">Manage the Thunder League platform</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-10">
        {statCards.map((card) => (
          <div key={card.label} className={`rounded-xl border p-4 ${card.color}`}>
            <p className="text-sm font-medium opacity-80">{card.label}</p>
            <p className="text-3xl font-bold mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <div className="lg:col-span-2 rounded-xl border border-border bg-white shadow-sm p-6">
          <h2 className="text-lg font-bold text-primary mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <a href="/admin/tournaments/create" className="px-4 py-3 rounded-lg bg-secondary text-white text-sm font-medium hover:bg-secondary/90 transition-colors text-center">
              Create Tournament
            </a>
            <a href="/admin/tournaments" className="px-4 py-3 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors text-center">
              Edit Tournament
            </a>
            <a href="/admin/leaderboard" className="px-4 py-3 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors text-center">
              Update Leaderboard
            </a>
            <a href="/admin/users" className="px-4 py-3 rounded-lg bg-surface text-primary text-sm font-medium hover:bg-surface/80 transition-colors text-center border border-border">
              Manage Users
            </a>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-white shadow-sm p-6">
          <h2 className="text-lg font-bold text-primary mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {activities.length === 0 && (
              <p className="text-sm text-primary/40">No recent activity</p>
            )}
            {activities.slice(0, 6).map((a, i) => (
              <div key={i} className="text-sm border-b border-border/50 pb-2 last:border-0">
                <span className={
                  a.type === "user_registered" ? "text-emerald-600" :
                  a.type === "tournament_created" ? "text-blue-600" :
                  "text-amber-600"
                }>
                  {a.type === "user_registered" ? "👤 " : a.type === "tournament_created" ? "🏆 " : "📊 "}
                </span>
                <span className="text-primary/80">{a.message}</span>
                <span className="block text-[11px] text-primary/40 mt-0.5">
                  {new Date(a.timestamp).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
