import { createClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const actionLabels: Record<string, string> = {
  create_tournament: "Created tournament",
  update_tournament: "Edited tournament",
  delete_tournament: "Deleted tournament",
  update_tournament_status: "Changed tournament status",
  promote_admin: "Promoted to admin",
  demote_user: "Demoted to user",
  suspend_user: "Suspended user",
  unsuspend_user: "Reactivated user",
  add_leaderboard_entry: "Added leaderboard entry",
  update_leaderboard_entry: "Updated leaderboard entry",
  delete_leaderboard_entry: "Deleted leaderboard entry",
};

export default async function AdminLogsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role").eq("id", user.id).single();

  if (profile?.role !== "admin" && profile?.role !== "super_admin") {
    redirect("/dashboard");
  }

  const admin = getAdminClient();
  const { data: logs } = await admin
    .from("admin_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  const adminIds = [...new Set((logs ?? []).map((l) => l.admin_id))];
  const { data: admins } = await admin
    .from("profiles")
    .select("id, username")
    .in("id", adminIds);

  const usernameMap: Record<string, string> = {};
  if (admins) {
    for (const a of admins) usernameMap[a.id] = a.username;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Audit Logs</h1>
        <p className="text-primary/60 mt-1">All admin actions recorded with timestamps</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface border-b border-border">
              <th className="px-4 py-3 text-left font-semibold text-primary/60 text-xs uppercase tracking-wider">Time</th>
              <th className="px-4 py-3 text-left font-semibold text-primary/60 text-xs uppercase tracking-wider">Admin</th>
              <th className="px-4 py-3 text-left font-semibold text-primary/60 text-xs uppercase tracking-wider">Action</th>
              <th className="px-4 py-3 text-left font-semibold text-primary/60 text-xs uppercase tracking-wider">Target</th>
              <th className="px-4 py-3 text-left font-semibold text-primary/60 text-xs uppercase tracking-wider">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(!logs || logs.length === 0) && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-primary/40">No audit logs recorded yet</td>
              </tr>
            )}
            {logs?.map((log) => (
              <tr key={log.id} className="hover:bg-surface/50 transition-colors">
                <td className="px-4 py-3 text-primary/50 text-xs whitespace-nowrap">
                  {new Date(log.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-3 font-medium text-primary">
                  {usernameMap[log.admin_id] || log.admin_id.slice(0, 8)}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    log.action.includes("delete") || log.action.includes("suspend") ? "bg-red-100 text-red-700" :
                    log.action.includes("create") || log.action.includes("promote") || log.action.includes("unsuspend") ? "bg-emerald-100 text-emerald-700" :
                    "bg-blue-100 text-blue-700"
                  }`}>
                    {actionLabels[log.action] || log.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-primary/70 text-xs">
                  {log.target_type}: {log.target_id ? log.target_id.slice(0, 8) + "..." : "—"}
                </td>
                <td className="px-4 py-3 text-primary/40 text-xs max-w-[200px] truncate">
                  {log.details ? JSON.stringify(log.details) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
