import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const admin = getAdminClient();
  const { data } = await admin.from("site_settings").select("*").order("key", { ascending: true });
  return NextResponse.json({ settings: data ?? [] });
}
