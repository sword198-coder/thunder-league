import HeroBanner from "@/components/HeroBanner";

export default function Home() {
  return (
    <>
      <HeroBanner />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
            Welcome to Thunder<span className="text-secondary">League</span>
          </h2>
          <p className="text-primary/60 text-lg leading-relaxed">
            The ultimate War Thunder esports championship where the world&apos;s best pilots
            compete for glory. Battle across historical aircraft, dominate the leaderboard,
            and etch your name in aviation history.
          </p>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-surface border border-border">
              <div className="text-3xl mb-2">🏆</div>
              <h3 className="font-semibold text-primary mb-1">Grand Prize</h3>
              <p className="text-sm text-primary/60">championship pool</p>
            </div>
            <div className="p-6 rounded-xl bg-surface border border-border">
              <div className="text-3xl mb-2">🌍</div>
              <h3 className="font-semibold text-primary mb-1">Global Arena</h3>
              <p className="text-sm text-primary/60">Players from 50+ countries</p>
            </div>
            <div className="p-6 rounded-xl bg-surface border border-border">
              <div className="text-3xl mb-2">🎮</div>
              <h3 className="font-semibold text-primary mb-1">Live Streams</h3>
              <p className="text-sm text-primary/60">Watch on YouTube & Twitch</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
