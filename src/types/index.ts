export interface LeaderboardEntry {
  rank: number;
  playerName: string;
  kills: number;
  wins: number;
  score: number;
  country: string;
}

export interface AuthFormProps {
  mode: "login" | "register";
}

export interface NavLink {
  label: string;
  href: string;
  external?: boolean;
}

export type TournamentTier = "Top" | "High" | "Mid" | "Low";

export type TournamentLifecycleState = "CREATED" | "OPEN" | "FULL" | "ACTIVE" | "COMPLETED";

export type TournamentStatus = TournamentLifecycleState;

export type PlayerStatus = "ready" | "playing" | "won" | "eliminated";

export type BattleVehicle = "air" | "ground";

export interface BracketPlayer {
  name: string;
  country: string;
  status: PlayerStatus;
  vehicleType: BattleVehicle;
  vehicleTier: string;
}

export interface ScheduleSlot {
  tier: TournamentTier;
  label: string;
  days: string;
  airTiers: string;
  groundTiers: string;
}

export interface Match {
  round: "QF" | "SF" | "F";
  position: number;
  matchNumber: number;
  status: string;
  scheduledTime: string;
  player1: BracketPlayer | null;
  player2: BracketPlayer | null;
  winner: string | null;
}

export interface Tournament {
  id: string;
  name: string;
  tier: TournamentTier;
  status: TournamentStatus;
  currentPlayers: number;
  maxPlayers: number;
  startDate: string;
  endDate: string;
  registeredPlayers: BracketPlayer[];
  bracket: Match[] | null;
  createdAt: string;
}

export interface DrawBotStep {
  icon: string;
  label: string;
  done: boolean;
}

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface SchedulerRule {
  tier: TournamentTier;
  startDay: number;
  endDay: number;
}

export interface NotificationEvent {
  type: "tournament_created" | "tournament_open" | "tournament_full" | "bracket_generated" | "match_started" | "winner_declared";
  message: string;
  tournamentId: string;
  tournamentName: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

export interface MatchmakingRequest {
  playerName: string;
  preferredTier?: TournamentTier;
  playerCountry?: string;
  playerVehicleType?: BattleVehicle;
  playerVehicleTier?: string;
}
