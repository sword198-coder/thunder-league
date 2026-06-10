import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { logger } from "@/lib/logger";
import { logAdminAction } from "./auditService";
import type { AdminUser, AdminStats, RecentActivity, UserRole } from "@/types";

export async function getProfileRole(userId: string): Promise<string | null> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (error || !data) {
    logger.error("adminService: getProfileRole failed", { error: error?.message });
    return null;
  }
  return data.role;
}

export async function isAdmin(userId: string): Promise<boolean> {
  const role = await getProfileRole(userId);
  return role === "admin" || role === "super_admin";
}

export async function isSuperAdmin(userId: string): Promise<boolean> {
  const role = await getProfileRole(userId);
  return role === "super_admin";
}

export async function getAdminStats(): Promise<AdminStats | null> {
  const supabase = createBrowserClient();

  try {
    const [{ count: totalUsers }, { count: totalTournaments }, { count: activeTournaments }, { count: upcomingTournaments }, { count: leaderboardEntries }] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("tournaments").select("*", { count: "exact", head: true }),
      supabase.from("tournaments").select("*", { count: "exact", head: true }).in("status", ["ACTIVE", "FULL"]),
      supabase.from("tournaments").select("*", { count: "exact", head: true }).in("status", ["OPEN", "CREATED"]),
      supabase.from("leaderboard_entries").select("*", { count: "exact", head: true }),
    ]);

    return {
      totalUsers: totalUsers ?? 0,
      totalTournaments: totalTournaments ?? 0,
      activeTournaments: activeTournaments ?? 0,
      upcomingTournaments: upcomingTournaments ?? 0,
      leaderboardEntries: leaderboardEntries ?? 0,
    };
  } catch (err) {
    logger.error("adminService: getAdminStats failed", err);
    return null;
  }
}

export async function getRecentActivity(): Promise<RecentActivity[]> {
  const activities: RecentActivity[] = [];
  const supabase = createBrowserClient();

  try {
    const { data: recentUsers } = await supabase
      .from("profiles")
      .select("id, username, created_at")
      .order("created_at", { ascending: false })
      .limit(5);

    if (recentUsers) {
      for (const u of recentUsers) {
        activities.push({
          type: "user_registered",
          message: `${u.username} registered`,
          timestamp: u.created_at,
          userId: u.id,
        });
      }
    }

    const { data: recentTournaments } = await supabase
      .from("tournaments")
      .select("id, name, created_at")
      .order("created_at", { ascending: false })
      .limit(5);

    if (recentTournaments) {
      for (const t of recentTournaments) {
        activities.push({
          type: "tournament_created",
          message: `Tournament "${t.name}" created`,
          timestamp: t.created_at,
          tournamentId: t.id,
        });
      }
    }

    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return activities.slice(0, 10);
  } catch (err) {
    logger.error("adminService: getRecentActivity failed", err);
    return [];
  }
}

export async function fetchAllUsers(): Promise<AdminUser[]> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    logger.error("adminService: fetchAllUsers failed", { error: error.message });
    return [];
  }
  return (data ?? []).map((u) => ({ ...u, role: u.role as AdminUser["role"] }));
}

export async function updateUserRole(adminId: string, targetUserId: string, role: UserRole): Promise<{ success: boolean; error?: string }> {
  const supabase = createBrowserClient();

  const adminRole = await getProfileRole(adminId);

  if (role === "admin" && adminRole !== "super_admin") {
    return { success: false, error: "Only super admins can promote to admin" };
  }

  if (role === "super_admin") {
    return { success: false, error: "Cannot assign super_admin role through this interface" };
  }

  const targetRole = await getProfileRole(targetUserId);
  if (targetRole === "super_admin") {
    return { success: false, error: "Cannot modify a super admin" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", targetUserId);

  if (error) {
    logger.error("adminService: updateUserRole failed", { error: error.message });
    return { success: false, error: error.message };
  }

  const action = role === "admin" ? "promote_to_admin" : "demote_to_user";
  await logAdminAction(adminId, action, "user", targetUserId, { newRole: role });
  logger.info("adminService: user role updated", { targetUserId, role });
  return { success: true };
}

export async function toggleUserSuspension(adminId: string, targetUserId: string, suspended: boolean): Promise<{ success: boolean; error?: string }> {
  const supabase = createBrowserClient();

  const targetRole = await getProfileRole(targetUserId);
  if (targetRole === "super_admin") {
    return { success: false, error: "Cannot suspend a super admin" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ suspended })
    .eq("id", targetUserId);

  if (error) {
    logger.error("adminService: toggleUserSuspension failed", { error: error.message });
    return { success: false, error: error.message };
  }

  const action = suspended ? "suspend_user" : "reactivate_user";
  await logAdminAction(adminId, action, "user", targetUserId, { suspended });
  logger.info("adminService: user suspension toggled", { targetUserId, suspended });
  return { success: true };
}
