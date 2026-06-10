import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { getAdminClient } from "@/lib/supabase/admin";
import { generateBracket } from "@/lib/bracketEngine";
import type { Match, BracketPlayer } from "@/types";
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

function getPlayersFromRegistrations(rows: Record<string, unknown>[]): BracketPlayer[] {
  return rows.map((r) => ({
    name: (r.player_name as string) || ((r.profiles as Record<string, unknown> | null)?.username as string) || r.user_id as string,
    country: "US",
    status: "ready" as const,
    vehicleType: "air" as const,
    vehicleTier: "V",
  }));
}

export async function generateBracketForTournament(tournamentId: string): Promise<{ success: boolean; error?: string; matches?: Match[] }> {
  try {
    const admin = getAdminClient();

    const { data: registrations, error: regError } = await admin
      .from("tournament_registrations")
      .select("*, profiles(username)")
      .eq("tournament_id", tournamentId)
      .eq("status", "approved");

    if (regError) throw new Error(regError.message);

    if (!registrations || registrations.length < 2) {
      return { success: false, error: "Need at least 2 approved players" };
    }

    const players = getPlayersFromRegistrations(registrations);
    const matches = generateBracket(players);

    await admin.from("matches").delete().eq("tournament_id", tournamentId);

    const rows = matches.map((m) => ({
      tournament_id: tournamentId,
      round: m.round,
      position: m.position,
      match_number: m.matchNumber,
      status: m.status,
      scheduled_time: m.scheduledTime,
      player1_name: m.player1?.name ?? null,
      player2_name: m.player2?.name ?? null,
      winner: null,
    }));

    const { error: insertError } = await admin.from("matches").insert(rows);
    if (insertError) throw new Error(insertError.message);

    await admin.from("tournaments").update({ status: "ACTIVE" }).eq("id", tournamentId);

    return { success: true, matches };
  } catch (err) {
    logger.error("bracketService: generateBracket failed", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to generate bracket" };
  }
}

export async function advanceMatchWinner(tournamentId: string, matchId: string, winnerName: string): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = getAdminClient();

    const { data: currentMatch } = await admin.from("matches").select("*").eq("id", matchId).single();
    if (!currentMatch) return { success: false, error: "Match not found" };

    await admin.from("matches").update({ winner: winnerName, status: "Completed" }).eq("id", matchId);

    const { data: allMatches } = await admin.from("matches")
      .select("*")
      .eq("tournament_id", tournamentId)
      .order("position", { ascending: true });

    if (allMatches) {
      const roundOrder = ["R32", "R16", "QF", "SF", "F"];
      const currentRound = currentMatch.round as string;
      const currentRoundIdx = roundOrder.indexOf(currentRound);

      if (currentRoundIdx < roundOrder.length - 1) {
        const nextRound = roundOrder[currentRoundIdx + 1];
        const nextMatchPosition = Math.ceil(currentMatch.position / 2);

        const nextMatch = allMatches.find(
          (m) => m.round === nextRound && m.position === nextMatchPosition
        );

        if (nextMatch) {
          if (currentMatch.position % 2 === 1) {
            await admin.from("matches").update({ player1_name: winnerName }).eq("id", nextMatch.id);
          } else {
            await admin.from("matches").update({ player2_name: winnerName }).eq("id", nextMatch.id);
          }

          if (nextMatch.player1_name && nextMatch.player2_name) {
            await admin.from("matches").update({ status: "Ready" }).eq("id", nextMatch.id);
          }
        }
      }

      if (currentRound === "F") {
        await admin.from("tournaments").update({ status: "COMPLETED" }).eq("id", tournamentId);
      }
    }

    return { success: true };
  } catch (err) {
    logger.error("bracketService: advanceMatchWinner failed", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}
