"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/lib/supabase/session-provider";
import { handleAuthRouting } from "@/lib/auth-route-guard";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    handleAuthRouting({ user, path: pathname, loading, router });
  }, [user, pathname, loading, router]);

  if (loading && (pathname === "/tournaments" || pathname === "/account")) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-pulse text-primary/40 text-sm">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}
