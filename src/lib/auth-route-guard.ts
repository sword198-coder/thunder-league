import type { User } from "@supabase/supabase-js";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export interface AuthRoutingInput {
  user: User | null;
  path: string;
  loading: boolean;
  router: AppRouterInstance;
}

export function handleAuthRouting({ user, path, loading, router }: AuthRoutingInput) {
  if (loading) return;

  if (user && (path === "/login" || path === "/register" || path === "/verify-login")) {
    router.replace("/tournaments");
  }
}
