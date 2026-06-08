import { scheduleSlots } from "@/data/tournaments";

const tierConfig: Record<string, { badge: string; gradient: string; border: string; glow: string }> = {
  Top: { badge: "bg-gradient-to-r from-amber-400 to-yellow-500", gradient: "from-amber-50 via-yellow-50/40 to-white", border: "border-amber-200", glow: "shadow-amber-200/40" },
  High: { badge: "bg-gradient-to-r from-slate-300 to-slate-400", gradient: "from-slate-50 via-blue-50/30 to-white", border: "border-slate-200", glow: "shadow-slate-200/40" },
  Mid: { badge: "bg-gradient-to-r from-blue-400 to-blue-500", gradient: "from-blue-50 via-indigo-50/30 to-white", border: "border-blue-200", glow: "shadow-blue-200/40" },
  Low: { badge: "bg-gradient-to-r from-emerald-400 to-green-500", gradient: "from-emerald-50 via-green-50/30 to-white", border: "border-emerald-200", glow: "shadow-emerald-200/40" },
};

const statusColors: Record<string, string> = {
  Top: "bg-amber-100 text-amber-700",
  High: "bg-slate-100 text-slate-600",
  Mid: "bg-blue-100 text-blue-700",
  Low: "bg-emerald-100 text-emerald-700",
};

export default function TournamentSchedule() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {scheduleSlots.map((slot) => {
        const cfg = tierConfig[slot.tier];
        return (
          <div
            key={slot.tier}
            className={`group relative rounded-xl border ${cfg.border} bg-gradient-to-br ${cfg.gradient} shadow-sm hover:shadow-lg ${cfg.glow} transition-all duration-300 hover:-translate-y-1 overflow-hidden`}
          >
            <div className={`h-1.5 ${cfg.badge}`} />
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold text-white ${cfg.badge} shadow-sm`}>
                  {slot.tier} TIER
                </span>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusColors[slot.tier]}`}>
                  Active
                </span>
              </div>

              <div>
                <h3 className="font-bold text-primary text-base">{slot.label}</h3>
                <p className="text-xs text-primary/50 mt-0.5">{slot.days}</p>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-primary/70">
                  <span className="text-sm">✈</span>
                  <span className="font-medium">Air:</span>
                  <span className="text-primary/60">Tier {slot.airTiers}</span>
                </div>
                <div className="flex items-center gap-2 text-primary/70">
                  <span className="text-sm">⬡</span>
                  <span className="font-medium">Ground:</span>
                  <span className="text-primary/60">Tier {slot.groundTiers}</span>
                </div>
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
}
