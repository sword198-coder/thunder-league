export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          email: string;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          email: string;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          email?: string;
          avatar_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      tournaments: {
        Row: {
          id: string;
          name: string;
          tier: string;
          status: string;
          current_players: number;
          max_players: number;
          start_date: string;
          end_date: string;
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          tier: string;
          status?: string;
          current_players?: number;
          max_players?: number;
          start_date: string;
          end_date: string;
          created_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          tier?: string;
          status?: string;
          current_players?: number;
          max_players?: number;
          start_date?: string;
          end_date?: string;
          created_at?: string;
          created_by?: string | null;
        };
        Relationships: [];
      };
      tournament_players: {
        Row: {
          id: string;
          tournament_id: string;
          player_name: string;
          country: string;
          status: string;
          vehicle_type: string;
          vehicle_tier: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          tournament_id: string;
          player_name: string;
          country?: string;
          status?: string;
          vehicle_type?: string;
          vehicle_tier?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          tournament_id?: string;
          player_name?: string;
          country?: string;
          status?: string;
          vehicle_type?: string;
          vehicle_tier?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      matches: {
        Row: {
          id: string;
          tournament_id: string;
          round: string;
          position: number;
          match_number: number;
          status: string;
          scheduled_time: string;
          player1_name: string | null;
          player2_name: string | null;
          winner: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tournament_id: string;
          round: string;
          position: number;
          match_number: number;
          status?: string;
          scheduled_time?: string;
          player1_name?: string | null;
          player2_name?: string | null;
          winner?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tournament_id?: string;
          round?: string;
          position?: number;
          match_number?: number;
          status?: string;
          scheduled_time?: string;
          player1_name?: string | null;
          player2_name?: string | null;
          winner?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
