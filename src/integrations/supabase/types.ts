export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          body: string | null
          created_at: string
          id: string
          image_url: string | null
          published: boolean
          title: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          published?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          published?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      chips: {
        Row: {
          description: string | null
          id: string
          name: string
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      fantasy_player_match_points: {
        Row: {
          breakdown: Json | null
          id: string
          match_id: string
          player_id: string
          points: number | null
        }
        Insert: {
          breakdown?: Json | null
          id?: string
          match_id: string
          player_id: string
          points?: number | null
        }
        Update: {
          breakdown?: Json | null
          id?: string
          match_id?: string
          player_id?: string
          points?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fantasy_player_match_points_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fantasy_player_match_points_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      fantasy_team_chips: {
        Row: {
          chip_id: string
          fantasy_team_id: string
          gameweek_id: string
          id: string
          used_at: string | null
        }
        Insert: {
          chip_id: string
          fantasy_team_id: string
          gameweek_id: string
          id?: string
          used_at?: string | null
        }
        Update: {
          chip_id?: string
          fantasy_team_id?: string
          gameweek_id?: string
          id?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fantasy_team_chips_chip_id_fkey"
            columns: ["chip_id"]
            isOneToOne: false
            referencedRelation: "chips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fantasy_team_chips_fantasy_team_id_fkey"
            columns: ["fantasy_team_id"]
            isOneToOne: false
            referencedRelation: "fantasy_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fantasy_team_chips_gameweek_id_fkey"
            columns: ["gameweek_id"]
            isOneToOne: false
            referencedRelation: "gameweeks"
            referencedColumns: ["id"]
          },
        ]
      }
      fantasy_team_match_points: {
        Row: {
          fantasy_team_id: string
          id: string
          match_id: string
          points: number | null
        }
        Insert: {
          fantasy_team_id: string
          id?: string
          match_id: string
          points?: number | null
        }
        Update: {
          fantasy_team_id?: string
          id?: string
          match_id?: string
          points?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fantasy_team_match_points_fantasy_team_id_fkey"
            columns: ["fantasy_team_id"]
            isOneToOne: false
            referencedRelation: "fantasy_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fantasy_team_match_points_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      fantasy_team_players: {
        Row: {
          bench_order: number | null
          fantasy_team_id: string
          id: string
          is_benched: boolean | null
          is_captain: boolean | null
          is_vice_captain: boolean | null
          player_id: string
        }
        Insert: {
          bench_order?: number | null
          fantasy_team_id: string
          id?: string
          is_benched?: boolean | null
          is_captain?: boolean | null
          is_vice_captain?: boolean | null
          player_id: string
        }
        Update: {
          bench_order?: number | null
          fantasy_team_id?: string
          id?: string
          is_benched?: boolean | null
          is_captain?: boolean | null
          is_vice_captain?: boolean | null
          player_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fantasy_team_players_fantasy_team_id_fkey"
            columns: ["fantasy_team_id"]
            isOneToOne: false
            referencedRelation: "fantasy_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fantasy_team_players_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      fantasy_teams: {
        Row: {
          budget: number | null
          created_at: string | null
          free_transfers: number | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          budget?: number | null
          created_at?: string | null
          free_transfers?: number | null
          id?: string
          name: string
          user_id: string
        }
        Update: {
          budget?: number | null
          created_at?: string | null
          free_transfers?: number | null
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fantasy_teams_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gameweeks: {
        Row: {
          end_date: string
          id: string
          number: number
          season_id: string
          start_date: string
        }
        Insert: {
          end_date: string
          id?: string
          number: number
          season_id: string
          start_date: string
        }
        Update: {
          end_date?: string
          id?: string
          number?: number
          season_id?: string
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "gameweeks_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          id: string
          number: number
        }
        Insert: {
          id?: string
          number: number
        }
        Update: {
          id?: string
          number?: number
        }
        Relationships: []
      }
      matches: {
        Row: {
          date: string
          gameweek_id: string
          id: string
          is_played: boolean | null
          motm_player_id: string | null
          season_id: string | null
          team1_id: string
          team2_id: string
        }
        Insert: {
          date: string
          gameweek_id: string
          id?: string
          is_played?: boolean | null
          motm_player_id?: string | null
          season_id?: string | null
          team1_id: string
          team2_id: string
        }
        Update: {
          date?: string
          gameweek_id?: string
          id?: string
          is_played?: boolean | null
          motm_player_id?: string | null
          season_id?: string | null
          team1_id?: string
          team2_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_gameweek_id_fkey"
            columns: ["gameweek_id"]
            isOneToOne: false
            referencedRelation: "gameweeks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_motm_player_id_fkey"
            columns: ["motm_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_team1_id_fkey"
            columns: ["team1_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_team2_id_fkey"
            columns: ["team2_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      player_match_stats: {
        Row: {
          assists: number
          bonus_points: number | null
          clean_sheet: boolean | null
          clean_sheets: number
          goals: number
          halfs_played: number | null
          id: string
          match_id: string
          minutes_played: number
          own_goals: number
          penalties_missed: number
          penalties_saved: number
          player_id: string
          red_cards: number
          total_saves: number
          yellow_cards: number
        }
        Insert: {
          assists?: number
          bonus_points?: number | null
          clean_sheet?: boolean | null
          clean_sheets?: number
          goals?: number
          halfs_played?: number | null
          id?: string
          match_id: string
          minutes_played?: number
          own_goals?: number
          penalties_missed?: number
          penalties_saved?: number
          player_id: string
          red_cards?: number
          total_saves?: number
          yellow_cards?: number
        }
        Update: {
          assists?: number
          bonus_points?: number | null
          clean_sheet?: boolean | null
          clean_sheets?: number
          goals?: number
          halfs_played?: number | null
          id?: string
          match_id?: string
          minutes_played?: number
          own_goals?: number
          penalties_missed?: number
          penalties_saved?: number
          player_id?: string
          red_cards?: number
          total_saves?: number
          yellow_cards?: number
        }
        Relationships: [
          {
            foreignKeyName: "player_match_stats_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_match_stats_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      player_season_price: {
        Row: {
          id: string
          player_id: string
          price: number
          season_id: string
        }
        Insert: {
          id?: string
          player_id: string
          price?: number
          season_id: string
        }
        Update: {
          id?: string
          player_id?: string
          price?: number
          season_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_season_price_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_season_price_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      player_season_stats: {
        Row: {
          assists: number
          clean_sheets: number
          goals: number
          id: string
          matches_played: number | null
          own_goals: number
          penalties_missed: number
          penalties_saved: number
          player_id: string
          red_cards: number
          season_id: string
          total_motm: number | null
          total_saves: number
          yellow_cards: number
        }
        Insert: {
          assists?: number
          clean_sheets?: number
          goals?: number
          id?: string
          matches_played?: number | null
          own_goals?: number
          penalties_missed?: number
          penalties_saved?: number
          player_id: string
          red_cards?: number
          season_id: string
          total_motm?: number | null
          total_saves?: number
          yellow_cards?: number
        }
        Update: {
          assists?: number
          clean_sheets?: number
          goals?: number
          id?: string
          matches_played?: number | null
          own_goals?: number
          penalties_missed?: number
          penalties_saved?: number
          player_id?: string
          red_cards?: number
          season_id?: string
          total_motm?: number | null
          total_saves?: number
          yellow_cards?: number
        }
        Relationships: [
          {
            foreignKeyName: "player_season_stats_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_season_stats_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          id: string
          last_name: string
          name: string
          position: string
          price: number
          team_id: string
        }
        Insert: {
          id?: string
          last_name: string
          name: string
          position: string
          price?: number
          team_id: string
        }
        Update: {
          id?: string
          last_name?: string
          name?: string
          position?: string
          price?: number
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      positions: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          display_name: string
          email: string
          id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      seasons: {
        Row: {
          end_date: string | null
          id: string
          number: number
          start_date: string | null
        }
        Insert: {
          end_date?: string | null
          id?: string
          number: number
          start_date?: string | null
        }
        Update: {
          end_date?: string | null
          id?: string
          number?: number
          start_date?: string | null
        }
        Relationships: []
      }
      team_match_stats: {
        Row: {
          goals_against: number
          goals_scored: number
          id: string
          match_id: string
          team_id: string
        }
        Insert: {
          goals_against?: number
          goals_scored?: number
          id?: string
          match_id: string
          team_id: string
        }
        Update: {
          goals_against?: number
          goals_scored?: number
          id?: string
          match_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_match_stats_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_match_stats_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_season_stats: {
        Row: {
          draws: number
          goals_conceded: number
          goals_scored: number
          id: string
          losses: number
          matches_played: number | null
          season_id: string
          team_id: string
          total_points: number
          wins: number
        }
        Insert: {
          draws?: number
          goals_conceded?: number
          goals_scored?: number
          id?: string
          losses?: number
          matches_played?: number | null
          season_id: string
          team_id: string
          total_points?: number
          wins?: number
        }
        Update: {
          draws?: number
          goals_conceded?: number
          goals_scored?: number
          id?: string
          losses?: number
          matches_played?: number | null
          season_id?: string
          team_id?: string
          total_points?: number
          wins?: number
        }
        Relationships: [
          {
            foreignKeyName: "team_season_stats_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_season_stats_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          group_id: string
          id: string
          name: string
        }
        Insert: {
          group_id: string
          id?: string
          name: string
        }
        Update: {
          group_id?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "student"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "student"],
    },
  },
} as const
