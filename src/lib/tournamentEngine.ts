import type { Tournament, Match, BracketPlayer, DrawBotStep, TournamentLifecycleState } from "@/types";
import { generateBracket } from "@/lib/bracketEngine";
import { logger } from "@/lib/logger";

export { generateBracket } from "@/lib/bracketEngine";

export interface DrawBotAnnouncement {
  type: "full" | "matchups" | "started";
  message: string;
}

export function generateDrawBotSteps(): DrawBotStep[] {
  return [
    { icon: "✓", label: "Registration Locked", done: true },
    { icon: "⟳", label: "Running Random Draw", done: true },
    { icon: "✓", label: "Bracket Generated", done: true },
    { icon: "✓", label: "Tournament Started", done: true },
  ];
}

export function runDrawBot(players: BracketPlayer[]): {
  bracket: Match[];
  announcements: DrawBotAnnouncement[];
  steps: DrawBotStep[];
} {
  const announcements: DrawBotAnnouncement[] = [
    { type: "full", message: `Tournament is FULL — ${players.length} players registered. Registration locked.` },
  ];

  const bracket = generateBracket(players);

  const roundLabel = bracket.length <= 3 ? "Semi Finals" :
    bracket.length <= 7 ? "Quarter Finals" :
    bracket.length <= 15 ? "Round of 16" : "Round of 32";

  announcements.push({ type: "matchups", message: "Matchups are ready! Bracket draw completed." });
  announcements.push({ type: "started", message: `Tournament STARTED — ${roundLabel} is now live!` });

  return { bracket, announcements, steps: generateDrawBotSteps() };
}

export function transitionTournamentState(
  tournament: Tournament,
  targetState: TournamentLifecycleState
): Tournament {
  const validTransitions: Record<TournamentLifecycleState, TournamentLifecycleState[]> = {
    CREATED: ["OPEN"],
    OPEN: ["FULL"],
    FULL: ["ACTIVE"],
    ACTIVE: ["COMPLETED"],
    COMPLETED: [],
  };

  const allowed = validTransitions[tournament.status] ?? [];
  if (!allowed.includes(targetState)) {
    logger.warn("Invalid state transition", { from: tournament.status, to: targetState });
    return tournament;
  }

  return { ...tournament, status: targetState };
}

export function checkAndAutoStart(tournament: Tournament): Tournament & { drawBotSteps?: DrawBotStep[] } {
  if (tournament.status === "FULL" && tournament.registeredPlayers.length >= tournament.maxPlayers) {
    const { bracket, steps } = runDrawBot(tournament.registeredPlayers);
    const activated = transitionTournamentState({ ...tournament, bracket }, "ACTIVE");
    return { ...activated, drawBotSteps: steps };
  }
  return tournament;
}

export function joinTournament(
  tournament: Tournament,
  playerName: string
): Tournament & { drawBotSteps?: DrawBotStep[] } {
  if (tournament.status !== "CREATED" && tournament.status !== "OPEN") {
    return tournament;
  }

  if (tournament.currentPlayers >= tournament.maxPlayers) {
    return tournament;
  }

  if (tournament.registeredPlayers.some((p) => p.name === playerName)) {
    return tournament;
  }

  const newPlayer: BracketPlayer = {
    name: playerName,
    country: "US",
    status: "ready",
    vehicleType: "air",
    vehicleTier: "V",
  };

  const updated: Tournament = {
    ...tournament,
    registeredPlayers: [...tournament.registeredPlayers, newPlayer],
    currentPlayers: tournament.currentPlayers + 1,
  };

  if (updated.currentPlayers >= updated.maxPlayers) {
    const { bracket, announcements, steps } = runDrawBot(updated.registeredPlayers);
    announcements.forEach((a) => logger.info("DrawBot", a));
    return { ...updated, bracket, status: "ACTIVE", drawBotSteps: steps };
  }

  if (tournament.status === "CREATED") {
    return transitionTournamentState(updated, "OPEN");
  }

  return updated;
}
