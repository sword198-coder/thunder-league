import type { Tournament, BracketPlayer, Match, ScheduleSlot } from "@/types";

export const scheduleSlots: ScheduleSlot[] = [
  { tier: "Top", label: "Top Tier Tournament", days: "Day 1 - Day 7", airTiers: "VIII - IX", groundTiers: "VIII" },
  { tier: "High", label: "High Tier Tournament", days: "Day 8 - Day 15", airTiers: "VI - VII", groundTiers: "VI - VII" },
  { tier: "Mid", label: "Mid Tier Tournament", days: "Day 16 - Day 21", airTiers: "IV - V", groundTiers: "V" },
  { tier: "Low", label: "Low Tier Tournament", days: "Day 22 - Day 27", airTiers: "II - III", groundTiers: "III - IV" },
];

const p = (name: string, country: string, vehicle: "air" | "ground" = "air", tier: string = "VIII"): BracketPlayer => ({
  name, country, status: "ready", vehicleType: vehicle, vehicleTier: tier,
});

const m = (round: "QF" | "SF" | "F", pos: number, num: number, p1: BracketPlayer | null, p2: BracketPlayer | null, status = "Ready", time = "20:00 UTC"): Match => ({
  round, position: pos, matchNumber: num, status, scheduledTime: time,
  player1: p1, player2: p2, winner: null,
});

export const defaultTournaments: Tournament[] = [
  {
    id: "t1",
    name: "Thunder Strike Cup",
    tier: "Top",
    status: "OPEN",
    currentPlayers: 5,
    maxPlayers: 8,
    startDate: "2026-07-01",
    endDate: "2026-07-07",
    registeredPlayers: [
      p("AcePilot_77", "US", "air", "IX"), p("Thunder_King", "RU", "air", "IX"),
      p("SkyFury_JP", "JP", "air", "VIII"), p("WarEagle_DE", "DE", "air", "IX"),
      p("NightOwl_FR", "FR", "air", "VIII"),
    ],
    bracket: null,
    createdAt: "2026-06-01T00:00:00Z",
  },
  {
    id: "t2",
    name: "Aerial Assault Series",
    tier: "High",
    status: "OPEN",
    currentPlayers: 3,
    maxPlayers: 8,
    startDate: "2026-07-08",
    endDate: "2026-07-15",
    registeredPlayers: [
      p("TankBreaker", "GB", "ground", "VII"), p("StormBringer", "CN", "air", "VII"), p("IronSight_IT", "IT", "ground", "VI"),
    ],
    bracket: null,
    createdAt: "2026-06-01T00:00:00Z",
  },
  {
    id: "t3",
    name: "Dogfight Championship",
    tier: "Mid",
    status: "ACTIVE",
    currentPlayers: 8,
    maxPlayers: 8,
    startDate: "2026-07-15",
    endDate: "2026-07-21",
    registeredPlayers: [
      p("BlazeFury_IL", "IL", "air", "V"), p("ShadowStrike", "SE", "ground", "V"),
      p("NightOwl_FR", "FR", "air", "IV"), p("AcePilot_77", "US", "air", "V"),
      p("Thunder_King", "RU", "air", "V"), p("SkyFury_JP", "JP", "air", "IV"),
      p("WarEagle_DE", "DE", "air", "V"), p("IronSight_IT", "IT", "ground", "IV"),
    ],
    bracket: [
      m("QF", 1, 1, p("BlazeFury_IL", "IL", "air", "V"), p("ShadowStrike", "SE", "ground", "V"), "Playing", "18:00 UTC"),
      m("QF", 2, 2, p("NightOwl_FR", "FR", "air", "IV"), p("AcePilot_77", "US", "air", "V"), "Ready", "19:00 UTC"),
      m("QF", 3, 3, p("Thunder_King", "RU", "air", "V"), p("SkyFury_JP", "JP", "air", "IV"), "Ready", "20:00 UTC"),
      m("QF", 4, 4, p("WarEagle_DE", "DE", "air", "V"), p("IronSight_IT", "IT", "ground", "IV"), "Ready", "21:00 UTC"),
      m("SF", 1, 5, null, null, "Pending", "TBD"),
      m("SF", 2, 6, null, null, "Pending", "TBD"),
      m("F", 1, 7, null, null, "Pending", "TBD"),
    ],
    createdAt: "2026-06-01T00:00:00Z",
  },
  {
    id: "t4",
    name: "Wings of Glory",
    tier: "Low",
    status: "OPEN",
    currentPlayers: 2,
    maxPlayers: 8,
    startDate: "2026-07-22",
    endDate: "2026-07-27",
    registeredPlayers: [
      p("BlazeFury_IL", "IL", "air", "III"), p("StormBringer", "CN", "air", "III"),
    ],
    bracket: null,
    createdAt: "2026-06-01T00:00:00Z",
  },
];
