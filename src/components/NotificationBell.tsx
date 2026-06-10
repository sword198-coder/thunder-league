"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "@/lib/supabase/session-provider";
import { fetchNotifications, markNotificationRead, markAllNotificationsRead, getUnreadCount } from "@/lib/services/notificationService";
import type { AppNotification } from "@/types";

export default function NotificationBell() {
  const { user } = useSession();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [user]);

  async function load() {
    const n = await fetchNotifications(user!.id);
    setNotifications(n);
    const u = await getUnreadCount(user!.id);
    setUnread(u);
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleMarkRead(id: string) {
    await markNotificationRead(id);
    load();
  }

  async function handleMarkAllRead() {
    await markAllNotificationsRead(user!.id);
    load();
  }

  if (!user) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-primary/50 hover:text-primary hover:bg-white/10 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-border bg-white shadow-xl z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-bold text-primary">Notifications</h3>
            {unread > 0 && (
              <button onClick={handleMarkAllRead} className="text-xs text-secondary hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-primary/40 text-center py-8">No notifications</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleMarkRead(n.id)}
                  className={`w-full text-left px-4 py-3 border-b border-border/50 hover:bg-surface/50 transition-colors ${
                    !n.read ? "bg-blue-50/50" : ""
                  }`}
                >
                  <p className="text-sm font-medium text-primary">{n.title}</p>
                  <p className="text-xs text-primary/50 mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-primary/30 mt-1">{new Date(n.created_at).toLocaleDateString()}</p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
