import { createClient as createBrowserClient } from "@/lib/supabase/client";
import type { Match } from "@/types";
import { logger } from "@/lib/logger";

function mapRowToMatch(row: Record<string, unknown>): Match {
  return {
    round: row.round as Match["round"],
    position: row.position as number,
    matchNumber: row.match_number as number,
    status: row.status as string,
    scheduledTime: row.scheduled_time as string,
    player1: row.player1_name
      ? { name: row.player1_name as string, country: "", status: "ready", vehicleType: "air", vehicleTier: "" }
      : null,
    player2: row.player2_name
      ? { name: row.player2_name as string, country: "", status: "ready", vehicleType: "air", vehicleTier: "" }
      : null,
    winner: row.winner as string | null,
  };
}

export async function fetchMatches(tournamentId: string): Promise<Match[]> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .eq("tournament_id", tournamentId)
    .order("position", { ascending: true });

  if (error) {
    logger.error("bracketService: fetchMatches failed", { error: error.message });
    return [];
  }

  return (data ?? []).map(mapRowToMatch);
}

export async function saveMatches(tournamentId: string, matches: Match[]): Promise<boolean> {
  const supabase = createBrowserClient();
  const rows = matches.map((m) => ({
    tournament_id: tournamentId,
    round: m.round,
    position: m.position,
    match_number: m.matchNumber,
    status: m.status,
    scheduled_time: m.scheduledTime,
    player1_name: m.player1?.name ?? null,
    player2_name: m.player2?.name ?? null,
    winner: m.winner,
  }));

  const { error } = await supabase.from("matches").insert(rows);
  if (error) {
    logger.error("bracketService: saveMatches failed", { error: error.message });
    return false;
  }
  return true;
}

export async function updateMatchWinner(matchId: string, winner: string): Promise<boolean> {
  const supabase = createBrowserClient();
  const { error } = await supabase
    .from("matches")
    .update({ winner, status: "Completed" })
    .eq("id", matchId);

  if (error) {
    logger.error("bracketService: updateWinner failed", { error: error.message });
    return false;
  }
  return true;
}
