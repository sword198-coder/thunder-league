import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { logger } from "@/lib/logger";
import type { AppNotification } from "@/types";

export async function fetchNotifications(userId: string): Promise<AppNotification[]> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    logger.error("notificationService: fetch failed", { error: error.message });
    return [];
  }

  return (data ?? []).map((r) => ({
    id: r.id,
    user_id: r.user_id,
    type: r.type,
    title: r.title,
    message: r.message,
    link: r.link,
    read: r.read,
    created_at: r.created_at,
  }));
}

export async function markNotificationRead(notificationId: string): Promise<boolean> {
  const supabase = createBrowserClient();
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId);

  if (error) {
    logger.error("notificationService: markRead failed", { error: error.message });
    return false;
  }
  return true;
}

export async function markAllNotificationsRead(userId: string): Promise<boolean> {
  const supabase = createBrowserClient();
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("read", false);

  if (error) {
    logger.error("notificationService: markAllRead failed", { error: error.message });
    return false;
  }
  return true;
}

export async function getUnreadCount(userId: string): Promise<number> {
  const supabase = createBrowserClient();
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false);

  if (error) {
    logger.error("notificationService: unreadCount failed", { error: error.message });
    return 0;
  }
  return count ?? 0;
}
