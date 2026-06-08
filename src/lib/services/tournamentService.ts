import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { createClient as createServerClient } from "@/lib/supabase/server";
import type { Tournament } from "@/types";
import { logger } from "@/lib/logger";

function mapRowToTournament(row: Record<string, unknown>): Tournament {
  return {
    id: row.id as string,
    name: row.name as string,
    tier: row.tier as Tournament["tier"],
    status: row.status as Tournament["status"],
    currentPlayers: row.current_players as number,
    maxPlayers: row.max_players as number,
    startDate: row.start_date as string,
    endDate: row.end_date as string,
    registeredPlayers: [],
    bracket: null,
    createdAt: row.created_at as string,
  };
}

export async function fetchTournaments(): Promise<Tournament[]> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from("tournaments")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    logger.error("tournamentService: fetch failed", { error: error.message });
    return [];
  }

  return (data ?? []).map(mapRowToTournament);
}

export async function fetchTournamentsServer(): Promise<Tournament[]> {
  const supabase = await createServerClient();
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

export async function createTournament(tournament: Omit<Tournament, "id" | "createdAt">): Promise<Tournament | null> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from("tournaments")
    .insert({
      name: tournament.name,
      tier: tournament.tier,
      status: tournament.status,
      current_players: tournament.currentPlayers,
      max_players: tournament.maxPlayers,
      start_date: tournament.startDate,
      end_date: tournament.endDate,
    })
    .select()
    .single();

  if (error) {
    logger.error("tournamentService: create failed", { error: error.message });
    return null;
  }

  return mapRowToTournament(data);
}

export async function updateTournamentStatus(id: string, status: string): Promise<boolean> {
  const supabase = createBrowserClient();
  const { error } = await supabase
    .from("tournaments")
    .update({ status })
    .eq("id", id);

  if (error) {
    logger.error("tournamentService: updateStatus failed", { error: error.message });
    return false;
  }
  return true;
}
