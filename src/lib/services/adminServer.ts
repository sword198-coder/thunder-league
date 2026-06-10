import { createClient } from "@/lib/supabase/server";

export async function isAdminServer(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (error || !data) return false;
    return data.role === "admin" || data.role === "super_admin";
  } catch {
    return false;
  }
}
