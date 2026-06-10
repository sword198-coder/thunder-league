export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          email: string;
          avatar_url: string | null;
          role: string;
          suspended: boolean;
          wins: number;
          losses: number;
          bio: string;
          discord_id: string;
          discord_username: string;
          discord_avatar: string;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          email: string;
          avatar_url?: string | null;
          role?: string;
          suspended?: boolean;
          wins?: number;
          losses?: number;
          bio?: string;
          discord_id?: string;
          discord_username?: string;
          discord_avatar?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          email?: string;
          avatar_url?: string | null;
          role?: string;
          suspended?: boolean;
          wins?: number;
          losses?: number;
          bio?: string;
          discord_id?: string;
          discord_username?: string;
          discord_avatar?: string;
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
          description?: string;
          banner_url?: string | null;
          prize_pool?: string;
          registration_deadline?: string | null;
          rules?: string;
          game?: string;
          stream_url?: string;
          discord_link?: string;
          trailer_url?: string;
          sponsors?: string;
          check_in_open?: boolean;
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
          description?: string;
          banner_url?: string | null;
          prize_pool?: string;
          registration_deadline?: string | null;
          rules?: string;
          game?: string;
          stream_url?: string;
          discord_link?: string;
          trailer_url?: string;
          sponsors?: string;
          check_in_open?: boolean;
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
      leaderboard_entries: {
        Row: {
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
        };
        Insert: {
          id?: string;
          player_name: string;
          team_name?: string;
          rank?: number;
          points?: number;
          wins?: number;
          losses?: number;
          avatar_url?: string | null;
          country?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          player_name?: string;
          team_name?: string;
          rank?: number;
          points?: number;
          wins?: number;
          losses?: number;
          avatar_url?: string | null;
          country?: string;
          created_at?: string;
          updated_at?: string;
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
      tournament_registrations: {
        Row: {
          id: string;
          user_id: string;
          tournament_id: string;
          status: string;
          checked_in: boolean;
          check_in_at: string | null;
          registered_at: string;
          updated_at: string;
          player_name: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tournament_id: string;
          status?: string;
          checked_in?: boolean;
          check_in_at?: string | null;
          registered_at?: string;
          updated_at?: string;
          player_name?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          tournament_id?: string;
          status?: string;
          checked_in?: boolean;
          check_in_at?: string | null;
          registered_at?: string;
          updated_at?: string;
          player_name?: string;
        };
        Relationships: [];
      };
      admin_logs: {
        Row: {
          id: string;
          admin_id: string;
          action: string;
          target_type: string;
          target_id: string | null;
          details: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_id: string;
          action: string;
          target_type: string;
          target_id?: string | null;
          details?: Record<string, unknown> | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          admin_id?: string;
          action?: string;
          target_type?: string;
          target_id?: string | null;
          details?: Record<string, unknown> | null;
          created_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          link: string;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          message?: string;
          link?: string;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          message?: string;
          link?: string;
          read?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      site_settings: {
        Row: {
          id: string;
          key: string;
          value: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          value?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
