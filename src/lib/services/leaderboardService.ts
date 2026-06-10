import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { logger } from "@/lib/logger";
import type { LeaderboardEntry } from "@/types";

export function mapRowToEntry(row: Record<string, unknown>): LeaderboardEntry {
  return {
    id: row.id as string,
    player_name: row.player_name as string,
    team_name: row.team_name as string,
    rank: row.rank as number,
    points: row.points as number,
    wins: row.wins as number,
    losses: row.losses as number,
    avatar_url: row.avatar_url as string | null,
    country: row.country as string,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from("leaderboard_entries")
    .select("*")
    .order("rank", { ascending: true });

  if (error) {
    logger.error("leaderboardService: fetch failed", { error: error.message });
    return [];
  }
  return (data ?? []).map(mapRowToEntry);
}

export async function addLeaderboardEntry(entry: Omit<LeaderboardEntry, "id" | "created_at" | "updated_at">): Promise<LeaderboardEntry | null> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from("leaderboard_entries")
    .insert({
      player_name: entry.player_name,
      team_name: entry.team_name,
      rank: entry.rank,
      points: entry.points,
      wins: entry.wins,
      losses: entry.losses,
      avatar_url: entry.avatar_url,
      country: entry.country,
    })
    .select()
    .single();

  if (error) {
    logger.error("leaderboardService: add failed", { error: error.message });
    return null;
  }
  return mapRowToEntry(data);
}

export async function updateLeaderboardEntry(id: string, entry: Partial<Omit<LeaderboardEntry, "id" | "created_at" | "updated_at">>): Promise<boolean> {
  const supabase = createBrowserClient();
  const { error } = await supabase
    .from("leaderboard_entries")
    .update({ ...entry, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    logger.error("leaderboardService: update failed", { error: error.message });
    return false;
  }
  return true;
}

export async function deleteLeaderboardEntry(id: string): Promise<boolean> {
  const supabase = createBrowserClient();
  const { error } = await supabase
    .from("leaderboard_entries")
    .delete()
    .eq("id", id);

  if (error) {
    logger.error("leaderboardService: delete failed", { error: error.message });
    return false;
  }
  return true;
}

export async function reorderLeaderboard(entries: { id: string; rank: number }[]): Promise<boolean> {
  const supabase = createBrowserClient();

  const updates = entries.map((e) =>
    supabase
      .from("leaderboard_entries")
      .update({ rank: e.rank, updated_at: new Date().toISOString() })
      .eq("id", e.id)
  );

  const results = await Promise.all(updates);
  const errors = results.filter((r) => r.error);
  if (errors.length > 0) {
    logger.error("leaderboardService: reorder failed", { errors: errors.map((e) => e.error?.message) });
    return false;
  }
  return true;
}
