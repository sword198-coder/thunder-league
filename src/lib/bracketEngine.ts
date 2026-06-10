import type { BracketPlayer, Match, RoundType } from "@/types";

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getRounds(playerCount: number): RoundType[] {
  if (playerCount <= 4) return ["SF", "F"];
  if (playerCount <= 8) return ["QF", "SF", "F"];
  if (playerCount <= 16) return ["R16", "QF", "SF", "F"];
  return ["R32", "R16", "QF", "SF", "F"];
}

const ROUND_MATCH_COUNT: Record<RoundType, number> = {
  R32: 16, R16: 8, QF: 4, SF: 2, F: 1,
};

export function generateBracket(players: BracketPlayer[]): Match[] {
  const shuffled = shuffleArray(players);
  const matches: Match[] = [];

  const rounds = getRounds(players.length);
  const firstRound = rounds[0];
  const firstRoundMatchCount = ROUND_MATCH_COUNT[firstRound];
  const neededPlayers = firstRoundMatchCount * 2;

  const pool = [...shuffled];
  while (pool.length < neededPlayers) {
    pool.push({ name: "BYE", country: "", status: "ready", vehicleType: "air", vehicleTier: "" });
  }

  let matchNumber = 1;

  for (const [roundIdx, round] of rounds.entries()) {
    const matchCount = ROUND_MATCH_COUNT[round];

    for (let i = 0; i < matchCount; i++) {
      const p1 = roundIdx === 0 ? (pool[i * 2] ?? null) : null;
      const p2 = roundIdx === 0 ? (pool[i * 2 + 1] ?? null) : null;

      matches.push({
        round,
        position: i + 1,
        matchNumber: matchNumber++,
        status: roundIdx === 0 ? "Ready" : "Pending",
        scheduledTime: roundIdx === 0 ? getScheduledTime(i) : "TBD",
        player1: p1,
        player2: p2,
        winner: null,
      });
    }
  }

  return matches;
}

function getScheduledTime(index: number): string {
  const times = ["18:00 UTC", "19:00 UTC", "20:00 UTC", "21:00 UTC", "22:00 UTC", "23:00 UTC",
    "18:30 UTC", "19:30 UTC", "20:30 UTC", "21:30 UTC", "22:30 UTC",
    "17:00 UTC", "17:30 UTC", "23:30 UTC", "16:00 UTC", "16:30 UTC"];
  return times[index] ?? "TBD";
}

export { getRounds, ROUND_MATCH_COUNT };
