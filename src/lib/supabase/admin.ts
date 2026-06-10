import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

let adminClient: ReturnType<typeof createClient<Database>> | null = null;

export function getAdminClient() {
  if (!adminClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
      throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY env var");
    }

    adminClient = createClient<Database>(url, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return adminClient;
}
