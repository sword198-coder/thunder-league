"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { UserRole } from "@/types";

interface SessionContextValue {
  user: User | null;
  role: UserRole | null;
  username: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue>({
  user: null,
  role: null,
  username: null,
  loading: true,
  signOut: async () => {},
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  async function fetchRole(userId: string) {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("role, username")
        .eq("id", userId)
        .single();
      setRole(data?.role as UserRole | null ?? null);
      setUsername(data?.username ?? null);
    } catch {
      // fetchRole failed silently - role/username remain null
    }
  }

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser()
      .then(({ data: { user } }) => {
        setUser(user);
        if (user) fetchRole(user.id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchRole(session.user.id);
        } else {
          setRole(null);
          setUsername(null);
        }
        setLoading(false);

        if (event === "SIGNED_IN") {
          router.push("/tournaments");
        }
      } catch {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    setUsername(null);
    router.push("/");
  };

  return (
    <SessionContext.Provider value={{ user, role, username, loading, signOut }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}

