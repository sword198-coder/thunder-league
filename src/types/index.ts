export interface LeaderboardEntry {
  id: string;
  player_name: string;
  team_name: string;
  rank: number;
  points: number;
  wins: number;
  losses: number;
  avatar_url: string | null;
  country: string;
  created_at: string;
  updated_at: string;
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

export type RoundType = "R32" | "R16" | "QF" | "SF" | "F";

export interface Match {
  round: RoundType;
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
  description: string;
  banner_url: string | null;
  prize_pool: string;
  registration_deadline: string | null;
  rules: string;
  game: string;
  stream_url: string;
  discord_link: string;
  trailer_url: string;
  sponsors: string;
  check_in_open: boolean;
  registeredPlayers: BracketPlayer[];
  bracket: Match[] | null;
  created_by: string | null;
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

export type UserRole = "user" | "admin" | "super_admin";

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  role: UserRole;
  suspended: boolean;
  created_at: string;
}

export interface AdminStats {
  totalUsers: number;
  totalTournaments: number;
  activeTournaments: number;
  upcomingTournaments: number;
  leaderboardEntries: number;
}

export interface RecentActivity {
  type: "user_registered" | "tournament_created" | "leaderboard_updated";
  message: string;
  timestamp: string;
  userId?: string;
  tournamentId?: string;
}

export type AdminTournamentStatus = "upcoming" | "registration_open" | "live" | "completed" | "cancelled";

export interface AdminTournament {
  id: string;
  name: string;
  description: string;
  game: string;
  banner_image: string | null;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  max_teams: number;
  prize_pool: string;
  status: AdminTournamentStatus;
  created_by: string | null;
  created_at: string;
}

export interface AdminLog {
  id: string;
  admin_id: string;
  action: string;
  target_type: string;
  target_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

export type RegistrationStatus = "pending" | "approved" | "rejected" | "waitlist" | "banned";

export interface TournamentRegistration {
  id: string;
  user_id: string;
  tournament_id: string;
  status: RegistrationStatus;
  checked_in: boolean;
  check_in_at: string | null;
  registered_at: string;
  updated_at: string;
}

export interface DiscordPayload {
  username?: string;
  content?: string;
  embeds?: Array<{
    title: string;
    description: string;
    color: number;
    fields?: Array<{ name: string; value: string; inline?: boolean }>;
    timestamp?: string;
  }>;
}

export interface AppNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  link: string;
  read: boolean;
  created_at: string;
}

export interface SiteSetting {
  id: string;
  key: string;
  value: string;
  updated_at: string;
}

export interface PlayerProfile {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  role: UserRole;
  wins: number;
  losses: number;
  bio: string;
  discord_username: string;
  created_at: string;
}
