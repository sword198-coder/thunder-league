import type { Tournament, Match, BracketPlayer, DrawBotStep, TournamentLifecycleState } from "@/types";
import { logger } from "@/lib/logger";

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function generateBracket(players: BracketPlayer[]): Match[] {
  const shuffled = shuffleArray(players);
  const matches: Match[] = [];
  const times = ["18:00 UTC", "19:00 UTC", "20:00 UTC", "21:00 UTC"];

  for (let i = 0; i < 4; i++) {
    matches.push({
      round: "QF",
      position: i + 1,
      matchNumber: i + 1,
      status: "Ready",
      scheduledTime: times[i],
      player1: shuffled[i * 2] ?? null,
      player2: shuffled[i * 2 + 1] ?? null,
      winner: null,
    });
  }

  for (let i = 0; i < 2; i++) {
    matches.push({
      round: "SF",
      position: i + 1,
      matchNumber: i + 5,
      status: "Pending",
      scheduledTime: "TBD",
      player1: null,
      player2: null,
      winner: null,
    });
  }

  matches.push({
    round: "F",
    position: 1,
    matchNumber: 7,
    status: "Pending",
    scheduledTime: "TBD",
    player1: null,
    player2: null,
    winner: null,
  });

  logger.info("Bracket generated", { players: players.length, matches: matches.length });
  return matches;
}

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

  announcements.push({ type: "matchups", message: "Matchups are ready! Bracket draw completed." });
  announcements.push({ type: "started", message: "Tournament STARTED — Round 1 (Quarter Finals) is now live!" });

  logger.info("DrawBot executed", { playerCount: players.length });

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

  logger.info("State transition", { id: tournament.id, from: tournament.status, to: targetState });
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
    logger.warn("Cannot join tournament", { status: tournament.status });
    return tournament;
  }

  if (tournament.currentPlayers >= tournament.maxPlayers) {
    logger.warn("Tournament is full", { id: tournament.id });
    return tournament;
  }

  if (tournament.registeredPlayers.some((p) => p.name === playerName)) {
    logger.warn("Player already registered", { playerName, tournamentId: tournament.id });
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
