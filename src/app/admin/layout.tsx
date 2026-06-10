import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

const adminNavLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/tournaments", label: "Tournaments" },
  { href: "/admin/leaderboard", label: "Leaderboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/logs", label: "Audit Logs" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, suspended")
    .eq("id", user.id)
    .single();

  const role = profile?.role;
  if (role !== "admin" && role !== "super_admin") {
    redirect("/dashboard");
  }

  if (profile?.suspended) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-white text-xs font-bold">TL</span>
            <div>
              <h2 className="text-sm font-bold text-primary">Admin Panel</h2>
              <p className="text-[11px] text-primary/40">{role === "super_admin" ? "Super Admin" : "Admin"}</p>
            </div>
          </div>
          <Link href="/tournaments" className="text-xs text-primary/40 hover:text-primary/60 transition-colors">
            ← Back to Site
          </Link>
        </div>

        <nav className="flex items-center gap-1 mb-6 overflow-x-auto">
          {adminNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-primary/60 hover:text-primary hover:bg-white/80 transition-colors whitespace-nowrap"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {children}
      </div>
    </div>
  );
}
