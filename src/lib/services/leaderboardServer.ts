import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import type { LeaderboardEntry } from "@/types";
import { mapRowToEntry } from "./leaderboardService";

export async function fetchLeaderboardServer(): Promise<LeaderboardEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leaderboard_entries")
    .select("*")
    .order("rank", { ascending: true });

  if (error) {
    logger.error("leaderboardService: fetchServer failed", { error: error.message });
    return [];
  }
  return (data ?? []).map(mapRowToEntry);
}
