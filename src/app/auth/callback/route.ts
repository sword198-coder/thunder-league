import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/tournaments";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      logger.info("auth/callback: code exchanged successfully");
      return NextResponse.redirect(`${origin}${next}`);
    }
    logger.error("auth/callback: code exchange failed", { error: error.message });
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
