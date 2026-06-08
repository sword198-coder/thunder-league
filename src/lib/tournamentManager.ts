import type { Tournament, TournamentTier, MatchmakingRequest, DrawBotStep, NotificationEvent } from "@/types";
import { joinTournament } from "@/lib/tournamentEngine";
import { runScheduler } from "@/lib/schedulerEngine";
import { tournamentCreated, tournamentFull, bracketGenerated } from "@/lib/notificationService";
import { logger } from "@/lib/logger";

let store: Tournament[] = [];
let initialized = false;

export function initializeTournaments(seed: Tournament[]): Tournament[] {
  if (!initialized) {
    store = runScheduler(seed);
    initialized = true;
    logger.info("TournamentManager: Initialized", { count: store.length });
  }
  return [...store];
}

export function resetStore(seed?: Tournament[]): Tournament[] {
  initialized = false;
  store = seed ?? [];
  return initializeTournaments(seed ?? []);
}

export function getTournaments(): Tournament[] {
  return [...store];
}

export interface JoinResult {
  tournament: Tournament;
  tournaments: Tournament[];
  drawBotSteps?: DrawBotStep[];
  notifications: NotificationEvent[];
}

export function processJoinRequest(request: MatchmakingRequest): JoinResult {
  const notifications: NotificationEvent[] = [];
  const playerName = request.playerName;

  store = runScheduler(store);

  const target = findBestTournament(playerName, request);
  if (!target) {
    logger.warn("Matchmaking: No suitable tournament found", { playerName });
    return { tournament: store[0], tournaments: [...store], notifications };
  }

  const result = joinTournament(target, playerName);
  const idx = store.findIndex((t) => t.id === target.id);
  if (idx !== -1) {
    store[idx] = result as Tournament;
  }

  if (result.drawBotSteps) {
    const fullTournament = store.find((t) => t.id === target.id);
    if (fullTournament) {
      notifications.push(tournamentFull(fullTournament));
      notifications.push(bracketGenerated(fullTournament));
    }
  }

  logger.info("Matchmaking: Player assigned", {
    playerName,
    tournament: target.name,
    tier: target.tier,
  });

  return {
    tournament: store[idx] ?? target,
    tournaments: [...store],
    drawBotSteps: result.drawBotSteps,
    notifications,
  };
}

export function createTournamentAutomatically(tier: TournamentTier): Tournament {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const tierStartDays: Record<TournamentTier, number> = { Top: 1, High: 8, Mid: 16, Low: 22 };
  const tierEndDays: Record<TournamentTier, number> = { Top: 7, High: 15, Mid: 21, Low: 27 };

  const startDay = tierStartDays[tier] ?? 1;
  const endDay = tierEndDays[tier] ?? 28;

  const newTournament: Tournament = {
    id: `auto-${tier.toLowerCase()}-${Date.now()}`,
    name: `${tier} Tier Tournament`,
    tier,
    status: "OPEN",
    currentPlayers: 0,
    maxPlayers: 8,
    startDate: new Date(year, month, startDay).toISOString().split("T")[0],
    endDate: new Date(year, month, endDay).toISOString().split("T")[0],
    registeredPlayers: [],
    bracket: null,
    createdAt: now.toISOString(),
  };

  store.push(newTournament);
  tournamentCreated(newTournament);

  logger.info("TournamentManager: Auto-created tournament", { tier, id: newTournament.id });

  return newTournament;
}

function findBestTournament(playerName: string, request: MatchmakingRequest): Tournament | null {
  const candidates = store.filter((t) => {
    if (t.status !== "OPEN") return false;
    if (t.currentPlayers >= t.maxPlayers) return false;
    if (t.registeredPlayers.some((p) => p.name === playerName)) return false;
    if (request.preferredTier && t.tier !== request.preferredTier) return false;
    return true;
  });

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => {
    const timeDiff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (timeDiff !== 0) return timeDiff;
    return b.currentPlayers - a.currentPlayers;
  });

  return candidates[0] ?? null;
}
