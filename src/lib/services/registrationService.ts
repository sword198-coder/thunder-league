import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { logger } from "@/lib/logger";
import type { TournamentRegistration, RegistrationStatus } from "@/types";

export async function fetchMyRegistrations(userId: string): Promise<TournamentRegistration[]> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from("tournament_registrations")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    logger.error("registrationService: fetchMyRegistrations failed", { error: error.message });
    return [];
  }
  return (data ?? []).map((r) => ({
    id: r.id,
    user_id: r.user_id,
    tournament_id: r.tournament_id,
    status: r.status as RegistrationStatus,
    checked_in: (r as Record<string, unknown>).checked_in as boolean ?? false,
    check_in_at: (r as Record<string, unknown>).check_in_at as string | null ?? null,
    registered_at: r.registered_at,
    updated_at: r.updated_at,
    player_name: (r as Record<string, unknown>).player_name as string ?? "",
  }));
}

export async function registerForTournament(userId: string, tournamentId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createBrowserClient();

  const { data: existing } = await supabase
    .from("tournament_registrations")
    .select("id")
    .eq("user_id", userId)
    .eq("tournament_id", tournamentId)
    .maybeSingle();

  if (existing) {
    return { success: false, error: "Already registered" };
  }

  const { error } = await supabase.from("tournament_registrations").insert({
    user_id: userId,
    tournament_id: tournamentId,
    status: "pending",
  });

  if (error) {
    logger.error("registrationService: register failed", { error: error.message });
    return { success: false, error: error.message };
  }

  logger.info("registrationService: registered", { userId, tournamentId });
  return { success: true };
}

export async function fetchTournamentRegistrations(tournamentId: string): Promise<TournamentRegistration[]> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from("tournament_registrations")
    .select("*")
    .eq("tournament_id", tournamentId)
    .order("registered_at", { ascending: true });

  if (error) {
    logger.error("registrationService: fetchTournamentRegistrations failed", { error: error.message });
    return [];
  }
  return (data ?? []).map((r) => ({
    id: r.id,
    user_id: r.user_id,
    tournament_id: r.tournament_id,
    status: r.status as RegistrationStatus,
    checked_in: (r as Record<string, unknown>).checked_in as boolean ?? false,
    check_in_at: (r as Record<string, unknown>).check_in_at as string | null ?? null,
    registered_at: r.registered_at,
    updated_at: r.updated_at,
    player_name: (r as Record<string, unknown>).player_name as string ?? "",
  }));
}

export async function updateRegistrationStatus(registrationId: string, status: RegistrationStatus): Promise<boolean> {
  const supabase = createBrowserClient();
  const { error } = await supabase
    .from("tournament_registrations")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", registrationId);

  if (error) {
    logger.error("registrationService: updateStatus failed", { error: error.message });
    return false;
  }
  return true;
}
