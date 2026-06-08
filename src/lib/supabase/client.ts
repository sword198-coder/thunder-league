"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

function getClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

let client: ReturnType<typeof getClient> | null = null;

export function createClient() {
  if (!client) client = getClient();
  return client;
}
