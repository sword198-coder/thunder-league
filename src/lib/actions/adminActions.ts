"use server";

import { createClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";
import { revalidatePath } from "next/cache";
import type { UserRole, TournamentTier, TournamentStatus } from "@/types";

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, suspended")
    .eq("id", user.id)
    .single();

  if (!profile || profile.suspended) throw new Error("Unauthorized");
  if (profile.role !== "admin" && profile.role !== "super_admin") throw new Error("Forbidden");

  return { userId: user.id, role: profile.role };
}

async function log(adminId: string, action: string, targetType: string, targetId?: string | null, details?: Record<string, unknown> | null) {
  try {
    const admin = getAdminClient();
    await admin.from("admin_logs").insert({
      admin_id: adminId,
      action,
      target_type: targetType,
      target_id: targetId ?? null,
      details: details ?? null,
    });
  } catch (err) {
    logger.error("adminActions: log failed", err);
  }
}

export async function deleteTournamentAction(tournamentId: string, tournamentName: string) {
  try {
    const { userId } = await verifyAdmin();
    const admin = getAdminClient();
    const { error } = await admin.from("tournaments").delete().eq("id", tournamentId);
    if (error) throw new Error(error.message);
    await log(userId, "delete_tournament", "tournament", tournamentId, { name: tournamentName });
    revalidatePath("/admin/tournaments");
    return { success: true };
  } catch (err) {
    logger.error("adminActions: deleteTournamentAction failed", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function createTournamentAction(data: {
  name: string; tier: TournamentTier; status: TournamentStatus;
  maxPlayers: number; startDate: string; endDate: string;
  description?: string; prize_pool?: string; registration_deadline?: string | null;
  rules?: string; game?: string; banner_url?: string | null;
}) {
  try {
    const { userId } = await verifyAdmin();
    const admin = getAdminClient();

    const { data: tournament, error } = await admin.from("tournaments").insert({
      name: data.name, tier: data.tier, status: data.status,
      current_players: 0, max_players: data.maxPlayers,
      start_date: data.startDate, end_date: data.endDate,
      description: data.description ?? "", banner_url: data.banner_url ?? null,
      prize_pool: data.prize_pool ?? "", registration_deadline: data.registration_deadline ?? null,
      rules: data.rules ?? "", game: data.game ?? "War Thunder",
      created_by: userId,
    }).select().single();

    if (error) throw new Error(error.message);
    await log(userId, "create_tournament", "tournament", tournament.id, { name: data.name });
    revalidatePath("/admin/tournaments");
    return { success: true, tournament };
  } catch (err) {
    logger.error("adminActions: createTournamentAction failed", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function updateTournamentAction(tournamentId: string, data: {
  name?: string; tier?: string; status?: string;
  current_players?: number; max_players?: number;
  start_date?: string; end_date?: string;
  description?: string; prize_pool?: string;
  registration_deadline?: string | null; rules?: string; game?: string;
}) {
  try {
    const { userId } = await verifyAdmin();
    const admin = getAdminClient();

    const { data: old } = await admin.from("tournaments").select("name").eq("id", tournamentId).single();
    const { error } = await admin.from("tournaments").update(data).eq("id", tournamentId);
    if (error) throw new Error(error.message);
    await log(userId, "update_tournament", "tournament", tournamentId, { changes: data, previousName: old?.name });
    revalidatePath("/admin/tournaments");
    return { success: true };
  } catch (err) {
    logger.error("adminActions: updateTournamentAction failed", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function updateLeaderboardEntryAction(entryId: string, data: {
  player_name?: string; team_name?: string; rank?: number;
  points?: number; wins?: number; losses?: number; country?: string;
}) {
  try {
    const { userId } = await verifyAdmin();
    const admin = getAdminClient();

    const { data: old } = await admin.from("leaderboard_entries").select("player_name").eq("id", entryId).single();
    const { error } = await admin.from("leaderboard_entries").update({ ...data, updated_at: new Date().toISOString() }).eq("id", entryId);
    if (error) throw new Error(error.message);
    await log(userId, "update_leaderboard_entry", "leaderboard", entryId, { changes: data, player: old?.player_name });
    revalidatePath("/admin/leaderboard");
    return { success: true };
  } catch (err) {
    logger.error("adminActions: updateLeaderboardEntryAction failed", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function updateUserRoleAction(targetUserId: string, role: UserRole) {
  try {
    const { userId, role: adminRole } = await verifyAdmin();

    if (role === "admin" && adminRole !== "super_admin") {
      return { success: false, error: "Only super admins can promote to admin" };
    }

    const admin = getAdminClient();
    const { data: target } = await admin.from("profiles").select("role, username").eq("id", targetUserId).single();
    if (target?.role === "super_admin") {
      return { success: false, error: "Cannot modify a super admin" };
    }

    const { error } = await admin.from("profiles").update({ role }).eq("id", targetUserId);
    if (error) throw new Error(error.message);

    const action = role === "admin" ? "promote_admin" : "demote_user";
    const oldRole = target?.role || "user";
    await log(userId, action, "user", targetUserId, { oldRole, newRole: role, username: target?.username });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (err) {
    logger.error("adminActions: updateUserRoleAction failed", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function toggleUserSuspensionAction(targetUserId: string, suspended: boolean) {
  try {
    const { userId } = await verifyAdmin();
    const admin = getAdminClient();

    const { data: target } = await admin.from("profiles").select("role, username").eq("id", targetUserId).single();
    if (target?.role === "super_admin") {
      return { success: false, error: "Cannot suspend a super admin" };
    }

    const { error } = await admin.from("profiles").update({ suspended }).eq("id", targetUserId);
    if (error) throw new Error(error.message);

    const action = suspended ? "suspend_user" : "unsuspend_user";
    await log(userId, action, "user", targetUserId, { suspended, username: target?.username });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (err) {
    logger.error("adminActions: toggleUserSuspensionAction failed", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function addLeaderboardEntryAction(data: {
  player_name: string; team_name: string; rank: number; points: number;
  wins: number; losses: number; country: string; avatar_url?: string | null;
}) {
  try {
    const { userId } = await verifyAdmin();
    const admin = getAdminClient();

    const { data: entry, error } = await admin.from("leaderboard_entries").insert({
      player_name: data.player_name, team_name: data.team_name,
      rank: data.rank, points: data.points, wins: data.wins,
      losses: data.losses, country: data.country,
      avatar_url: data.avatar_url ?? null,
    }).select().single();

    if (error) throw new Error(error.message);
    await log(userId, "add_leaderboard_entry", "leaderboard", entry.id, { player: data.player_name });
    revalidatePath("/admin/leaderboard");
    return { success: true, entry };
  } catch (err) {
    logger.error("adminActions: addLeaderboardEntryAction failed", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function deleteLeaderboardEntryAction(entryId: string) {
  try {
    const { userId } = await verifyAdmin();
    const admin = getAdminClient();

    const { data: old } = await admin.from("leaderboard_entries").select("player_name").eq("id", entryId).single();
    const { error } = await admin.from("leaderboard_entries").delete().eq("id", entryId);
    if (error) throw new Error(error.message);
    await log(userId, "delete_leaderboard_entry", "leaderboard", entryId, { player: old?.player_name });
    revalidatePath("/admin/leaderboard");
    return { success: true };
  } catch (err) {
    logger.error("adminActions: deleteLeaderboardEntryAction failed", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function generateBracketAction(tournamentId: string) {
  try {
    const { userId } = await verifyAdmin();
    const admin = getAdminClient();

    const { data: regs, error: regError } = await admin
      .from("tournament_registrations")
      .select("user_id")
      .eq("tournament_id", tournamentId)
      .eq("status", "approved");

    if (regError) throw new Error(regError.message);
    if (!regs || regs.length < 2) {
      return { success: false, error: "Need at least 2 approved players" };
    }

    const ids = regs.map((r: Record<string, string>) => r.user_id);
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, username")
      .in("id", ids);

    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p.username]));

    const { generateBracket } = await import("@/lib/bracketEngine");
    const players = (regs as Array<Record<string, string>>).map((r) => ({
      name: profileMap.get(r.user_id) || r.user_id.slice(0, 8),
      country: "US", status: "ready" as const, vehicleType: "air" as const, vehicleTier: "V",
    }));

    const matches = generateBracket(players);

    await admin.from("matches").delete().eq("tournament_id", tournamentId);

    const rows = matches.map((m) => ({
      tournament_id: tournamentId, round: m.round, position: m.position,
      match_number: m.matchNumber, status: m.status,
      scheduled_time: m.scheduledTime,
      player1_name: m.player1?.name ?? null, player2_name: m.player2?.name ?? null, winner: null,
    }));

    const { error: insertError } = await admin.from("matches").insert(rows);
    if (insertError) throw new Error(insertError.message);

    await admin.from("tournaments").update({ status: "ACTIVE" }).eq("id", tournamentId);
    await log(userId, "generate_bracket", "tournament", tournamentId);
    revalidatePath(`/admin/tournaments/${tournamentId}/bracket`);

    return { success: true };
  } catch (err) {
    logger.error("adminActions: generateBracket failed", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function advanceWinnerAction(tournamentId: string, matchId: string, winnerName: string) {
  try {
    const { userId } = await verifyAdmin();
    const admin = getAdminClient();

    const { data: currentMatch } = await admin.from("matches").select("*").eq("id", matchId).single();
    if (!currentMatch) return { success: false, error: "Match not found" };

    await admin.from("matches").update({ winner: winnerName, status: "Completed" }).eq("id", matchId);

    const { data: allMatches } = await admin.from("matches")
      .select("*").eq("tournament_id", tournamentId).order("position", { ascending: true });

    if (allMatches) {
      const roundOrder = ["R32", "R16", "QF", "SF", "F"];
      const currentRoundIdx = roundOrder.indexOf(currentMatch.round as string);

      if (currentRoundIdx >= 0 && currentRoundIdx < roundOrder.length - 1) {
        const nextRound = roundOrder[currentRoundIdx + 1];
        const nextMatchPosition = Math.ceil(currentMatch.position / 2);
        const nextMatch = allMatches.find((m) => m.round === nextRound && m.position === nextMatchPosition);

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

      if (currentMatch.round === "F") {
        await admin.from("tournaments").update({ status: "COMPLETED" }).eq("id", tournamentId);
      }
    }

    await log(userId, "advance_winner", "match", matchId, { winner: winnerName });
    revalidatePath(`/admin/tournaments/${tournamentId}/bracket`);
    return { success: true };
  } catch (err) {
    logger.error("adminActions: advanceWinner failed", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function updateRegistrationStatusAction(registrationId: string, status: string, tournamentId: string) {
  try {
    const { userId } = await verifyAdmin();
    const admin = getAdminClient();
    const { error } = await admin
      .from("tournament_registrations")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", registrationId);
    if (error) throw new Error(error.message);

    if (status === "approved") {
      const { data: reg } = await admin.from("tournament_registrations").select("user_id").eq("id", registrationId).single();
      if (reg) {
        await admin.from("notifications").insert({
          user_id: reg.user_id,
          type: "registration_approved",
          title: "Registration Approved",
          message: `Your registration for the tournament has been approved!`,
          link: `/tournaments/${tournamentId}`,
        });
      }
    }

    await log(userId, `registration_${status}`, "registration", registrationId, { tournamentId });
    revalidatePath(`/tournaments/${tournamentId}`);
    return { success: true };
  } catch (err) {
    logger.error("adminActions: updateRegistrationStatus failed", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function saveSiteSettingAction(key: string, value: string) {
  try {
    const { userId } = await verifyAdmin();
    const admin = getAdminClient();
    const { data: existing } = await admin.from("site_settings").select("id").eq("key", key).maybeSingle();
    if (existing) {
      await admin.from("site_settings").update({ value, updated_at: new Date().toISOString() }).eq("id", existing.id);
    } else {
      await admin.from("site_settings").insert({ key, value });
    }
    await log(userId, "update_site_setting", "setting", null, { key, value });
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (err) {
    logger.error("adminActions: saveSiteSetting failed", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function fetchSiteSettingsAction() {
  try {
    const admin = getAdminClient();
    const { data } = await admin.from("site_settings").select("*").order("key", { ascending: true });
    return (data ?? []) as Array<{ id: string; key: string; value: string; updated_at: string }>;
  } catch {
    return [];
  }
}

export async function updateTournamentStatusAction(tournamentId: string, status: string) {
  try {
    const { userId } = await verifyAdmin();
    const admin = getAdminClient();

    const { data: old } = await admin.from("tournaments").select("status, name").eq("id", tournamentId).single();
    const { error } = await admin.from("tournaments").update({ status }).eq("id", tournamentId);
    if (error) throw new Error(error.message);
    await log(userId, "update_tournament_status", "tournament", tournamentId, { from: old?.status, to: status, name: old?.name });
    revalidatePath("/admin/tournaments");
    return { success: true };
  } catch (err) {
    logger.error("adminActions: updateTournamentStatusAction failed", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}
