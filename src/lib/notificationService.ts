import type { NotificationEvent, Tournament } from "@/types";
import { logger } from "@/lib/logger";

const notificationHistory: NotificationEvent[] = [];

export function emitNotification(event: Omit<NotificationEvent, "timestamp">): NotificationEvent {
  const full: NotificationEvent = { ...event, timestamp: new Date().toISOString() };
  notificationHistory.push(full);
  logger.info("Notification", { type: full.type, tournament: full.tournamentName });
  return full;
}

export function tournamentCreated(t: Tournament): NotificationEvent {
  return emitNotification({
    type: "tournament_created",
    message: `Tournament "${t.name}" has been created for ${t.tier} Tier. Registration is now open!`,
    tournamentId: t.id,
    tournamentName: t.name,
    data: { tier: t.tier, startDate: t.startDate },
  });
}

export function tournamentOpen(t: Tournament): NotificationEvent {
  return emitNotification({
    type: "tournament_open",
    message: `Registration is now open for "${t.name}" — ${t.tier} Tier tournament.`,
    tournamentId: t.id,
    tournamentName: t.name,
  });
}

export function tournamentFull(t: Tournament): NotificationEvent {
  return emitNotification({
    type: "tournament_full",
    message: `"${t.name}" is FULL with ${t.currentPlayers} players. Registration locked!`,
    tournamentId: t.id,
    tournamentName: t.name,
  });
}

export function bracketGenerated(t: Tournament): NotificationEvent {
  return emitNotification({
    type: "bracket_generated",
    message: `Bracket has been generated for "${t.name}"! The tournament is now ACTIVE.`,
    tournamentId: t.id,
    tournamentName: t.name,
    data: { matchCount: t.bracket?.length },
  });
}

export function matchStarted(tournamentName: string, matchNumber: number): NotificationEvent {
  return emitNotification({
    type: "match_started",
    message: `Match #${matchNumber} in "${tournamentName}" has started!`,
    tournamentId: "",
    tournamentName,
    data: { matchNumber },
  });
}

export function winnerDeclared(tournamentName: string, winnerName: string): NotificationEvent {
  return emitNotification({
    type: "winner_declared",
    message: `🏆 "${tournamentName}" — Winner: ${winnerName}!`,
    tournamentId: "",
    tournamentName,
    data: { winner: winnerName },
  });
}

export function getNotifications(): NotificationEvent[] {
  return [...notificationHistory];
}

export function clearNotifications(): void {
  notificationHistory.length = 0;
}
