"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "@/lib/supabase/session-provider";

export default function HeroBanner() {
  const { user, loading } = useSession();

  return (
    <section className="relative w-full h-[500px] sm:h-[600px] lg:h-[700px] overflow-hidden">
      <Image
        src="/hero-banner.jpg"
        alt="Thunder League — War Thunder Esports Championship"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/30" />
      <div className="relative h-full flex items-center justify-center">
        <div className="text-center px-4 max-w-4xl">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-4 tracking-tight drop-shadow-lg">
            Thunder<span className="text-accent">League</span>
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-white/80 max-w-2xl mx-auto drop-shadow">
            The Official War Thunder Esports Championship
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/leaderboard"
              className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-secondary text-white font-semibold text-sm hover:bg-secondary/90 transition-colors shadow-lg"
            >
              View Leaderboard
            </Link>
            {!loading && user ? (
              <Link
                href="/tournaments"
                className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-secondary text-white font-semibold text-sm hover:bg-secondary/90 transition-colors shadow-lg"
              >
                Go to Tournaments
              </Link>
            ) : !loading && !user ? (
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-white/10 backdrop-blur-sm text-white font-semibold text-sm border border-white/20 hover:bg-white/20 transition-colors"
              >
                Join Tournament
              </Link>
            ) : (
              <div className="w-44 h-12" />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
