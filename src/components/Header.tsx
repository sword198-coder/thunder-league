"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/lib/supabase/session-provider";
import type { NavLink } from "@/types";
import NotificationBell from "@/components/NotificationBell";

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, role, loading, signOut } = useSession();

  console.log("DEBUG HEADER ROLE:", role);

  const admin = role === "admin" || role === "super_admin";

  const navLinks = useMemo(() => {
    const links: NavLink[] = [
      { label: "Home", href: "/" },
      { label: "Leaderboard", href: "/leaderboard" },
    ];

    if (user) {
      links.push({ label: "Tournaments", href: "/tournaments" });
    }

    if (admin) {
      links.push({ label: "Admin", href: "/admin" });
    }

    links.push(
      { label: "Discord", href: "https://discord.gg/bhHjQmV3Jn", external: true },
      { label: "YouTube", href: "https://youtube.com", external: true },
    );

    if (user) {
      links.push({ label: "My Account", href: "/account" });
    } else {
      links.push({ label: "Login", href: "/login" });
      links.push({ label: "Create Account", href: "/register" });
    }

    return links;
  }, [user, admin]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.jpg" alt="Thunder League" width={160} height={60} className="h-8 w-auto" />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {loading ? null : (
              <>
                {navLinks.map((link) => {
                  const isActive = !link.external && pathname === link.href;
                  const Comp = link.external ? "a" : Link;
                  const props = link.external
                    ? { href: link.href, target: "_blank", rel: "noopener noreferrer" }
                    : { href: link.href };
                  const isAuth = link.label === "Login" || link.label === "Create Account" || link.label === "My Account";

                  return (
                    <Comp
                      key={link.label}
                      {...props}
                      className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isAuth
                          ? link.label === "Create Account"
                            ? "bg-secondary text-white hover:bg-secondary/90 shadow-sm"
                            : "text-primary hover:bg-surface"
                          : isActive
                            ? "text-secondary"
                            : "text-primary/70 hover:text-primary hover:bg-surface"
                      }`}
                    >
                      {link.label}
                      {isActive && !link.external && (
                        <motion.div
                          layoutId="activeNav"
                          className="absolute bottom-0 left-2 right-2 h-0.5 bg-secondary rounded-full"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                    </Comp>
                  );
                })}
                {user && (
                  <>
                    <NotificationBell />
                    <button
                      onClick={signOut}
                      className="relative px-4 py-2 text-sm font-medium rounded-lg transition-colors bg-secondary text-white hover:bg-secondary/90 shadow-sm"
                    >
                      Logout
                    </button>
                  </>
                )}
              </>
            )}
          </nav>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-surface transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && !loading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => {
                const isActive = !link.external && pathname === link.href;
                const Comp = link.external ? "a" : Link;
                const props = link.external
                  ? { href: link.href, target: "_blank", rel: "noopener noreferrer" }
                  : { href: link.href };
                const isAuth = link.label === "Login" || link.label === "Create Account" || link.label === "My Account";

                return (
                  <Comp
                    key={link.label}
                    {...props}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isAuth
                        ? link.label === "Create Account"
                          ? "bg-secondary text-white hover:bg-secondary/90 text-center"
                          : "text-primary hover:bg-surface"
                        : isActive
                          ? "text-secondary bg-surface"
                          : "text-primary/70 hover:text-primary hover:bg-surface"
                    }`}
                  >
                    {link.label}
                  </Comp>
                );
              })}
              {user && (
                <button
                  onClick={() => { setMobileOpen(false); signOut(); }}
                  className="block w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors bg-secondary text-white hover:bg-secondary/90 text-center"
                >
                  Logout
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
