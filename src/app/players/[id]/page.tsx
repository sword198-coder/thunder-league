"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { PlayerProfile } from "@/types";

export default function PlayerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [tournamentCount, setTournamentCount] = useState(0);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: prof } = await supabase
        .from("profiles")
        .select("id, username, email, avatar_url, role, wins, losses, bio, discord_username, created_at")
        .eq("id", params.id as string)
        .single();

      if (prof) {
        setProfile({
          id: prof.id, username: prof.username, email: prof.email,
          avatar_url: prof.avatar_url, role: prof.role as PlayerProfile["role"],
          wins: prof.wins ?? 0, losses: prof.losses ?? 0,
          bio: prof.bio ?? "", discord_username: prof.discord_username ?? "",
          created_at: prof.created_at,
        });

        const { count } = await supabase
          .from("tournament_registrations")
          .select("*", { count: "exact", head: true })
          .eq("user_id", params.id as string)
          .eq("status", "approved");
        setTournamentCount(count ?? 0);
      }

      setPageLoading(false);
    })();
  }, [params.id]);

  if (pageLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-pulse text-primary/40 text-sm">Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <p className="text-primary/40">Player not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => router.back()} className="text-sm text-primary/40 hover:text-primary/60 mb-6 transition-colors">
        ← Back
      </button>

      <div className="rounded-xl border border-border bg-white shadow-sm p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-primary/30">{profile.username.slice(0, 2).toUpperCase()}</span>
            )}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center gap-3 justify-center sm:justify-start mb-1">
              <h1 className="text-2xl font-bold text-primary">{profile.username}</h1>
              {profile.role !== "user" && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  profile.role === "super_admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                }`}>
                  {profile.role === "super_admin" ? "SUPER ADMIN" : "ADMIN"}
                </span>
              )}
            </div>
            <p className="text-sm text-primary/50">Joined {new Date(profile.created_at).toLocaleDateString()}</p>
            {profile.discord_username && (
              <p className="text-sm text-primary/50 mt-1">Discord: {profile.discord_username}</p>
            )}
          </div>
        </div>

        {profile.bio && (
          <div className="mt-6 p-4 rounded-lg bg-surface/50">
            <p className="text-sm text-primary/70 leading-relaxed">{profile.bio}</p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="rounded-lg bg-surface/50 p-4 text-center">
            <p className="text-2xl font-bold text-primary">{profile.wins}</p>
            <p className="text-xs text-primary/50 mt-1">Wins</p>
          </div>
          <div className="rounded-lg bg-surface/50 p-4 text-center">
            <p className="text-2xl font-bold text-primary">{profile.losses}</p>
            <p className="text-xs text-primary/50 mt-1">Losses</p>
          </div>
          <div className="rounded-lg bg-surface/50 p-4 text-center">
            <p className="text-2xl font-bold text-primary">{tournamentCount}</p>
            <p className="text-xs text-primary/50 mt-1">Tournaments</p>
          </div>
        </div>
      </div>
    </div>
  );
}
