import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { logger } from "@/lib/logger";

export async function logAdminAction(
  adminId: string,
  action: string,
  targetType: string,
  targetId?: string | null,
  details?: Record<string, unknown> | null
): Promise<void> {
  try {
    const supabase = createBrowserClient();
    const { error } = await supabase.from("admin_logs").insert({
      admin_id: adminId,
      action,
      target_type: targetType,
      target_id: targetId ?? null,
      details: details ?? null,
    });

    if (error) {
      logger.error("auditService: logAdminAction failed", { error: error.message });
    }
  } catch (err) {
    logger.error("auditService: logAdminAction exception", err);
  }
}

export async function fetchAdminLogs(limit = 50): Promise<Array<{
  id: string;
  admin_id: string;
  action: string;
  target_type: string;
  target_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
  admin_name?: string;
}>> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from("admin_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    logger.error("auditService: fetchAdminLogs failed", { error: error.message });
    return [];
  }

  const rows = data ?? [];

  const adminIds = [...new Set(rows.map((r) => r.admin_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username")
    .in("id", adminIds);

  const usernameMap: Record<string, string> = {};
  if (profiles) {
    for (const p of profiles) {
      usernameMap[p.id] = p.username;
    }
  }

  return rows.map((row) => ({
    id: row.id,
    admin_id: row.admin_id,
    action: row.action,
    target_type: row.target_type,
    target_id: row.target_id,
    details: row.details,
    created_at: row.created_at,
    admin_name: usernameMap[row.admin_id],
  }));
}
