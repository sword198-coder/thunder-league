import type { TournamentTier, SchedulerRule, Tournament } from "@/types";
import { logger } from "@/lib/logger";

export const SCHEDULER_RULES: SchedulerRule[] = [
  { tier: "Top",  startDay: 1,  endDay: 7 },
  { tier: "High", startDay: 8,  endDay: 15 },
  { tier: "Mid",  startDay: 16, endDay: 21 },
  { tier: "Low",  startDay: 22, endDay: 27 },
];

export function getCurrentMonthDay(): number {
  return new Date().getDate();
}

export function getActiveTier(): TournamentTier | null {
  const day = getCurrentMonthDay();
  for (const rule of SCHEDULER_RULES) {
    if (day >= rule.startDay && day <= rule.endDay) return rule.tier;
  }
  return null;
}

export function getActiveSchedulerRules(): SchedulerRule[] {
  const day = getCurrentMonthDay();
  return SCHEDULER_RULES.filter((r) => day >= r.startDay && day <= r.endDay);
}

export function getDateRangeForTier(tier: TournamentTier, baseDate: Date = new Date()): { start: string; end: string } {
  const rule = SCHEDULER_RULES.find((r) => r.tier === tier);
  if (!rule) {
    const y = baseDate.getFullYear();
    const m = baseDate.getMonth();
    return {
      start: new Date(y, m, 1).toISOString().split("T")[0],
      end: new Date(y, m + 1, 0).toISOString().split("T")[0],
    };
  }
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const start = new Date(year, month, rule.startDay);
  const end = new Date(year, month, rule.endDay);
  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
  };
}

export function shouldCreateTournament(tier: TournamentTier, existing: Tournament[]): boolean {
  const active = existing.filter((t) => t.tier === tier && t.status !== "COMPLETED");
  const open = active.find((t) => t.status === "OPEN" && t.currentPlayers < t.maxPlayers);
  if (open) return false;
  const hasOpenOrActive = active.some((t) => t.status === "OPEN" || t.status === "FULL" || t.status === "ACTIVE");
  return !hasOpenOrActive;
}

export function getSchedulerDateRange(): { start: string; end: string } {
  const activeTier = getActiveTier();
  if (activeTier) return getDateRangeForTier(activeTier);
  const day = getCurrentMonthDay();
  if (day > 27) {
    const next = new Date();
    next.setMonth(next.getMonth() + 1);
    next.setDate(1);
    return getDateRangeForTier("Top", next);
  }
  const now = new Date();
  return {
    start: now.toISOString().split("T")[0],
    end: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0],
  };
}

export function runScheduler(existing: Tournament[]): Tournament[] {
  const activeTier = getActiveTier();
  if (!activeTier) {
    logger.info("Scheduler: No active tier for current date");
    return existing;
  }

  logger.info("Scheduler: Active tier", { tier: activeTier });
  const created: Tournament[] = [];

  for (const rule of SCHEDULER_RULES) {
    if (rule.tier === activeTier || getCurrentMonthDay() >= rule.startDay) {
      if (shouldCreateTournament(rule.tier, existing)) {
        const range = getDateRangeForTier(rule.tier);
        const newTournament: Tournament = {
          id: `auto-${rule.tier.toLowerCase()}-${Date.now()}`,
          name: `${rule.tier} Tier Tournament`,
          tier: rule.tier,
          status: "OPEN",
          currentPlayers: 0,
          maxPlayers: 8,
          startDate: range.start,
          endDate: range.end,
          registeredPlayers: [],
          bracket: null,
          createdAt: new Date().toISOString(),
        };
        created.push(newTournament);
        logger.info("Scheduler: Created tournament", { tier: rule.tier, id: newTournament.id });
      }
    }
  }

  return created.length > 0 ? [...existing, ...created] : existing;
}
