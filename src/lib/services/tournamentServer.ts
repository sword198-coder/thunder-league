import { createClient } from "@/lib/supabase/server";
import type { Tournament } from "@/types";
import { logger } from "@/lib/logger";
import { mapRowToTournament } from "./tournamentService";

export async function fetchTournamentsServer(): Promise<Tournament[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tournaments")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    logger.error("tournamentService: fetchServer failed", { error: error.message });
    return [];
  }

  return (data ?? []).map(mapRowToTournament);
}
