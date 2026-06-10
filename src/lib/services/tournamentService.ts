import { createClient as createBrowserClient } from "@/lib/supabase/client";
import type { Tournament } from "@/types";
import { logger } from "@/lib/logger";

export function mapRowToTournament(row: Record<string, unknown>): Tournament {
  return {
    id: row.id as string,
    name: row.name as string,
    tier: row.tier as Tournament["tier"],
    status: row.status as Tournament["status"],
    currentPlayers: row.current_players as number,
    maxPlayers: row.max_players as number,
    startDate: row.start_date as string,
    endDate: row.end_date as string,
    description: (row.description as string) ?? "",
    banner_url: row.banner_url as string | null ?? null,
    prize_pool: (row.prize_pool as string) ?? "",
    registration_deadline: row.registration_deadline as string | null ?? null,
    rules: (row.rules as string) ?? "",
    game: (row.game as string) ?? "War Thunder",
    stream_url: (row.stream_url as string) ?? "",
    discord_link: (row.discord_link as string) ?? "",
    trailer_url: (row.trailer_url as string) ?? "",
    sponsors: (row.sponsors as string) ?? "",
    check_in_open: (row.check_in_open as boolean) ?? false,
    registeredPlayers: [],
    bracket: null,
    created_by: row.created_by as string | null ?? null,
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
      description: tournament.description || "",
      banner_url: tournament.banner_url || null,
      prize_pool: tournament.prize_pool || "",
      registration_deadline: tournament.registration_deadline || null,
      rules: tournament.rules || "",
      game: tournament.game || "War Thunder",
    })
    .select()
    .single();

  if (error) {
    logger.error("tournamentService: create failed", { error: error.message });
    return null;
  }

  return mapRowToTournament(data);
}

export async function createTournamentFull(
  tournament: Omit<Tournament, "id" | "createdAt">,
  bannerFile?: File | null
): Promise<Tournament | null> {
  let bannerUrl: string | null = null;
  if (bannerFile) {
    const { uploadTournamentBanner } = await import("./bannerService");
    bannerUrl = await uploadTournamentBanner("new", bannerFile);
  }

  const result = await createTournament({
    ...tournament,
    banner_url: bannerUrl || tournament.banner_url,
  });
  return result;
}

export async function fetchTournamentById(id: string): Promise<Tournament | null> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from("tournaments")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    logger.error("tournamentService: fetchById failed", { error: error.message });
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

export async function updateTournament(id: string, updates: Partial<Omit<Tournament, "id" | "createdAt">>): Promise<boolean> {
  const supabase = createBrowserClient();
  const { error } = await supabase
    .from("tournaments")
    .update({
      ...(updates.name !== undefined && { name: updates.name }),
      ...(updates.tier !== undefined && { tier: updates.tier }),
      ...(updates.status !== undefined && { status: updates.status }),
      ...(updates.currentPlayers !== undefined && { current_players: updates.currentPlayers }),
      ...(updates.maxPlayers !== undefined && { max_players: updates.maxPlayers }),
      ...(updates.startDate !== undefined && { start_date: updates.startDate }),
      ...(updates.endDate !== undefined && { end_date: updates.endDate }),
      ...(updates.description !== undefined && { description: updates.description }),
      ...(updates.banner_url !== undefined && { banner_url: updates.banner_url }),
      ...(updates.prize_pool !== undefined && { prize_pool: updates.prize_pool }),
      ...(updates.registration_deadline !== undefined && { registration_deadline: updates.registration_deadline }),
      ...(updates.rules !== undefined && { rules: updates.rules }),
      ...(updates.game !== undefined && { game: updates.game }),
    })
    .eq("id", id);

  if (error) {
    logger.error("tournamentService: update failed", { error: error.message });
    return false;
  }
  return true;
}

export async function deleteTournament(id: string): Promise<boolean> {
  const supabase = createBrowserClient();
  const { error } = await supabase
    .from("tournaments")
    .delete()
    .eq("id", id);

  if (error) {
    logger.error("tournamentService: delete failed", { error: error.message });
    return false;
  }
  return true;
}
