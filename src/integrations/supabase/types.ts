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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      airports: {
        Row: {
          annual_fuel_demand_bbl: number | null
          created_at: string
          fuel_source_ids: Json | null
          iata_code: string
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          region_id: string | null
        }
        Insert: {
          annual_fuel_demand_bbl?: number | null
          created_at?: string
          fuel_source_ids?: Json | null
          iata_code: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          region_id?: string | null
        }
        Update: {
          annual_fuel_demand_bbl?: number | null
          created_at?: string
          fuel_source_ids?: Json | null
          iata_code?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          region_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "airports_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      alerts: {
        Row: {
          active: boolean
          channel: string
          created_at: string
          id: string
          last_fired_at: string | null
          name: string
          trigger_config: Json
          user_id: string
        }
        Insert: {
          active?: boolean
          channel?: string
          created_at?: string
          id?: string
          last_fired_at?: string | null
          name: string
          trigger_config?: Json
          user_id: string
        }
        Update: {
          active?: boolean
          channel?: string
          created_at?: string
          id?: string
          last_fired_at?: string | null
          name?: string
          trigger_config?: Json
          user_id?: string
        }
        Relationships: []
      }
      news_articles: {
        Row: {
          created_at: string
          headline: string
          id: string
          linked_event_id: string | null
          published_at: string
          risk_score: number | null
          source: string | null
          source_url: string | null
          summary: string | null
          tags: Json | null
        }
        Insert: {
          created_at?: string
          headline: string
          id?: string
          linked_event_id?: string | null
          published_at?: string
          risk_score?: number | null
          source?: string | null
          source_url?: string | null
          summary?: string | null
          tags?: Json | null
        }
        Update: {
          created_at?: string
          headline?: string
          id?: string
          linked_event_id?: string | null
          published_at?: string
          risk_score?: number | null
          source?: string | null
          source_url?: string | null
          summary?: string | null
          tags?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "news_articles_linked_event_id_fkey"
            columns: ["linked_event_id"]
            isOneToOne: false
            referencedRelation: "risk_events"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          plan: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          plan?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          plan?: string
        }
        Relationships: []
      }
      price_snapshots: {
        Row: {
          commodity: Database["public"]["Enums"]["commodity_type"]
          id: string
          price_usd: number
          region_id: string | null
          snapshot_at: string
          unit: string
        }
        Insert: {
          commodity: Database["public"]["Enums"]["commodity_type"]
          id?: string
          price_usd: number
          region_id?: string | null
          snapshot_at?: string
          unit?: string
        }
        Update: {
          commodity?: Database["public"]["Enums"]["commodity_type"]
          id?: string
          price_usd?: number
          region_id?: string | null
          snapshot_at?: string
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_snapshots_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          org_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          org_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          org_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      regions: {
        Row: {
          country_code: string
          created_at: string
          id: string
          latitude: number
          longitude: number
          name: string
          risk_level: Database["public"]["Enums"]["severity_level"]
          summary: string | null
        }
        Insert: {
          country_code: string
          created_at?: string
          id?: string
          latitude: number
          longitude: number
          name: string
          risk_level?: Database["public"]["Enums"]["severity_level"]
          summary?: string | null
        }
        Update: {
          country_code?: string
          created_at?: string
          id?: string
          latitude?: number
          longitude?: number
          name?: string
          risk_level?: Database["public"]["Enums"]["severity_level"]
          summary?: string | null
        }
        Relationships: []
      }
      risk_events: {
        Row: {
          affected_region_ids: Json | null
          affected_route_ids: Json | null
          created_at: string
          created_by: string | null
          description: string | null
          detected_at: string
          event_type: Database["public"]["Enums"]["event_type"]
          id: string
          resolved_at: string | null
          severity: Database["public"]["Enums"]["severity_level"]
          source_url: string | null
          title: string
        }
        Insert: {
          affected_region_ids?: Json | null
          affected_route_ids?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          detected_at?: string
          event_type: Database["public"]["Enums"]["event_type"]
          id?: string
          resolved_at?: string | null
          severity: Database["public"]["Enums"]["severity_level"]
          source_url?: string | null
          title: string
        }
        Update: {
          affected_region_ids?: Json | null
          affected_route_ids?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          detected_at?: string
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["severity_level"]
          source_url?: string | null
          title?: string
        }
        Relationships: []
      }
      routes: {
        Row: {
          annual_volume_bbl: number | null
          created_at: string
          destination_region_id: string | null
          id: string
          mode: Database["public"]["Enums"]["transport_mode"]
          name: string
          origin_region_id: string | null
          risk_score: number | null
          waypoints: Json | null
        }
        Insert: {
          annual_volume_bbl?: number | null
          created_at?: string
          destination_region_id?: string | null
          id?: string
          mode: Database["public"]["Enums"]["transport_mode"]
          name: string
          origin_region_id?: string | null
          risk_score?: number | null
          waypoints?: Json | null
        }
        Update: {
          annual_volume_bbl?: number | null
          created_at?: string
          destination_region_id?: string | null
          id?: string
          mode?: Database["public"]["Enums"]["transport_mode"]
          name?: string
          origin_region_id?: string | null
          risk_score?: number | null
          waypoints?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "routes_destination_region_id_fkey"
            columns: ["destination_region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routes_origin_region_id_fkey"
            columns: ["origin_region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      scenarios: {
        Row: {
          created_at: string
          description: string | null
          generated_at: string | null
          id: string
          is_public: boolean
          is_saved: boolean
          name: string
          result_details: Json | null
          result_summary: string | null
          trigger_config: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          generated_at?: string | null
          id?: string
          is_public?: boolean
          is_saved?: boolean
          name: string
          result_details?: Json | null
          result_summary?: string | null
          trigger_config?: Json
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          generated_at?: string | null
          id?: string
          is_public?: boolean
          is_saved?: boolean
          name?: string
          result_details?: Json | null
          result_summary?: string | null
          trigger_config?: Json
          user_id?: string
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          capacity_bpd: number | null
          created_at: string
          criticality_score: number | null
          id: string
          latitude: number | null
          longitude: number | null
          metadata: Json | null
          name: string
          region_id: string | null
          type: Database["public"]["Enums"]["supplier_type"]
        }
        Insert: {
          capacity_bpd?: number | null
          created_at?: string
          criticality_score?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          metadata?: Json | null
          name: string
          region_id?: string | null
          type: Database["public"]["Enums"]["supplier_type"]
        }
        Update: {
          capacity_bpd?: number | null
          created_at?: string
          criticality_score?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          metadata?: Json | null
          name?: string
          region_id?: string | null
          type?: Database["public"]["Enums"]["supplier_type"]
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
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
      watchlist_items: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
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
      app_role: "viewer" | "analyst" | "admin"
      commodity_type: "jet_fuel" | "crude_brent" | "crude_wti" | "diesel"
      event_type:
        | "conflict"
        | "sanction"
        | "disaster"
        | "strike"
        | "accident"
        | "policy"
      severity_level: "low" | "watch" | "elevated" | "critical"
      supplier_type: "refinery" | "port" | "pipeline" | "storage" | "chokepoint"
      transport_mode: "sea" | "air" | "rail" | "pipeline"
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
      app_role: ["viewer", "analyst", "admin"],
      commodity_type: ["jet_fuel", "crude_brent", "crude_wti", "diesel"],
      event_type: [
        "conflict",
        "sanction",
        "disaster",
        "strike",
        "accident",
        "policy",
      ],
      severity_level: ["low", "watch", "elevated", "critical"],
      supplier_type: ["refinery", "port", "pipeline", "storage", "chokepoint"],
      transport_mode: ["sea", "air", "rail", "pipeline"],
    },
  },
} as const
