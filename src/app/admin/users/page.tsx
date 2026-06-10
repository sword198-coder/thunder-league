"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/supabase/session-provider";
import { fetchAllUsers } from "@/lib/services/adminService";
import { updateUserRoleAction, toggleUserSuspensionAction } from "@/lib/actions/adminActions";
import type { AdminUser } from "@/types";

export default function AdminUsers() {
  const { user, loading } = useSession();
  const router = useRouter();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState<{ userId: string; action: string; label: string } | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/login"); return; }
    loadUsers();
  }, [user, loading, router]);

  async function loadUsers() {
    const data = await fetchAllUsers();
    setUsers(data);
    setPageLoading(false);
  }

  async function handleRoleChange(targetUserId: string, role: "user" | "admin") {
    const result = await updateUserRoleAction(targetUserId, role);
    if (result.success) loadUsers();
    else alert(result.error || "Failed to update role");
    setConfirmAction(null);
  }

  async function handleSuspension(targetUserId: string, suspended: boolean) {
    const result = await toggleUserSuspensionAction(targetUserId, suspended);
    if (result.success) loadUsers();
    else alert(result.error || "Failed to toggle suspension");
    setConfirmAction(null);
  }

  if (loading || pageLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-pulse text-primary/40 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">User Management</h1>
        <p className="text-primary/60 mt-1">Manage registered users, roles, and account status</p>
      </div>

      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm mx-4">
            <h3 className="text-lg font-bold text-primary mb-2">Confirm Action</h3>
            <p className="text-sm text-primary/70 mb-4">{confirmAction.label}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-surface"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmAction.action.startsWith("promote")) handleRoleChange(confirmAction.userId, "admin");
                  else if (confirmAction.action.startsWith("demote")) handleRoleChange(confirmAction.userId, "user");
                  else if (confirmAction.action.startsWith("suspend")) handleSuspension(confirmAction.userId, true);
                  else if (confirmAction.action.startsWith("reactivate")) handleSuspension(confirmAction.userId, false);
                }}
                className="px-4 py-2 rounded-lg bg-secondary text-white text-sm font-medium hover:bg-secondary/90"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface border-b border-border">
              <th className="px-4 py-3 text-left font-semibold text-primary/60 text-xs uppercase tracking-wider">Avatar</th>
              <th className="px-4 py-3 text-left font-semibold text-primary/60 text-xs uppercase tracking-wider">Username</th>
              <th className="px-4 py-3 text-left font-semibold text-primary/60 text-xs uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-center font-semibold text-primary/60 text-xs uppercase tracking-wider">Role</th>
              <th className="px-4 py-3 text-center font-semibold text-primary/60 text-xs uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-primary/60 text-xs uppercase tracking-wider">Created</th>
              <th className="px-4 py-3 text-right font-semibold text-primary/60 text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-primary/40">No users found</td>
              </tr>
            )}
            {users.map((u) => (
              <tr key={u.id} className={`hover:bg-surface/50 transition-colors ${u.suspended ? "opacity-60" : ""}`}>
                <td className="px-4 py-3">
                  {u.avatar_url ? (
                    <img src={u.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary/40">
                      {u.username?.[0]?.toUpperCase() || u.email?.[0]?.toUpperCase() || "?"}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 font-medium text-primary">{u.username || "—"}</td>
                <td className="px-4 py-3 text-primary/70">{u.email}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    u.role === "super_admin" ? "bg-rose-100 text-rose-700" :
                    u.role === "admin" ? "bg-purple-100 text-purple-700" :
                    "bg-slate-100 text-slate-700"
                  }`}>
                    {u.role === "super_admin" ? "super_admin" : u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    u.suspended ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                  }`}>
                    {u.suspended ? "Suspended" : "Active"}
                  </span>
                </td>
                <td className="px-4 py-3 text-primary/60 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {u.role === "super_admin" ? (
                      <span className="text-xs text-primary/30 italic">Protected</span>
                    ) : (
                      <>
                        {u.role === "user" ? (
                          <button
                            onClick={() => setConfirmAction({ userId: u.id, action: "promote", label: `Promote ${u.username || u.email} to admin?` })}
                            className="text-xs px-2 py-1 rounded bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
                          >
                            Promote
                          </button>
                        ) : (
                          u.id !== user?.id && (
                            <button
                              onClick={() => setConfirmAction({ userId: u.id, action: "demote", label: `Demote ${u.username || u.email} to user?` })}
                              className="text-xs px-2 py-1 rounded bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
                            >
                              Demote
                            </button>
                          )
                        )}
                        {u.suspended ? (
                          <button
                            onClick={() => setConfirmAction({ userId: u.id, action: "reactivate", label: `Reactivate ${u.username || u.email}?` })}
                            className="text-xs px-2 py-1 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                          >
                            Reactivate
                          </button>
                        ) : (
                          u.id !== user?.id && (
                            <button
                              onClick={() => setConfirmAction({ userId: u.id, action: "suspend", label: `Suspend ${u.username || u.email}?` })}
                              className="text-xs px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                            >
                              Suspend
                            </button>
                          )
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
