export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ai_settings: {
        Row: {
          created_at: string | null
          default_system_prompt: string | null
          default_user_prompt: string | null
          id: string
          max_tokens: number | null
          model: string | null
          temperature: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          default_system_prompt?: string | null
          default_user_prompt?: string | null
          id?: string
          max_tokens?: number | null
          model?: string | null
          temperature?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          default_system_prompt?: string | null
          default_user_prompt?: string | null
          id?: string
          max_tokens?: number | null
          model?: string | null
          temperature?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      company_profiles: {
        Row: {
          brand_keywords: string[] | null
          business_name: string | null
          location: string | null
          preferred_tone: string | null
          pricing_notes: string | null
          services_offered: string | null
          team_size: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          brand_keywords?: string[] | null
          business_name?: string | null
          location?: string | null
          preferred_tone?: string | null
          pricing_notes?: string | null
          services_offered?: string | null
          team_size?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          brand_keywords?: string[] | null
          business_name?: string | null
          location?: string | null
          preferred_tone?: string | null
          pricing_notes?: string | null
          services_offered?: string | null
          team_size?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          collection: string
          content: string
          content_type: string
          created_at: string | null
          embedding: string | null
          id: string
          metadata: Json | null
          title: string
        }
        Insert: {
          collection: string
          content: string
          content_type: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          title: string
        }
        Update: {
          collection?: string
          content?: string
          content_type?: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          title?: string
        }
        Relationships: []
      }
      generation_logs: {
        Row: {
          ai_response: string | null
          created_at: string
          final_prompt: string
          id: string
          model_used: string
          prompt_id: string | null
          proposal_id: string | null
          rag_context: string | null
          status: string
          system_prompt: string
          user_email: string
          user_id: string | null
          user_input: Json
        }
        Insert: {
          ai_response?: string | null
          created_at?: string
          final_prompt: string
          id?: string
          model_used: string
          prompt_id?: string | null
          proposal_id?: string | null
          rag_context?: string | null
          status?: string
          system_prompt: string
          user_email: string
          user_id?: string | null
          user_input: Json
        }
        Update: {
          ai_response?: string | null
          created_at?: string
          final_prompt?: string
          id?: string
          model_used?: string
          prompt_id?: string | null
          proposal_id?: string | null
          rag_context?: string | null
          status?: string
          system_prompt?: string
          user_email?: string
          user_id?: string | null
          user_input?: Json
        }
        Relationships: [
          {
            foreignKeyName: "generation_logs_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompt_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generation_logs_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "saved_proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          business_name: string | null
          company_name: string | null
          created_at: string
          full_name: string | null
          id: string
          is_admin: boolean | null
          location: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          business_name?: string | null
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          is_admin?: boolean | null
          location?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          business_name?: string | null
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          location?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      prompt_templates: {
        Row: {
          active: boolean
          created_at: string
          field_config: Json
          id: string
          name: string
          system_prompt: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          field_config?: Json
          id?: string
          name: string
          system_prompt: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          field_config?: Json
          id?: string
          name?: string
          system_prompt?: string
          updated_at?: string
        }
        Relationships: []
      }
      saved_proposals: {
        Row: {
          client_name: string | null
          content: string
          created_at: string
          id: string
          job_type: string | null
          status: string
          title: string
          user_id: string
        }
        Insert: {
          client_name?: string | null
          content: string
          created_at?: string
          id?: string
          job_type?: string | null
          status?: string
          title: string
          user_id: string
        }
        Update: {
          client_name?: string | null
          content?: string
          created_at?: string
          id?: string
          job_type?: string | null
          status?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      match_documents: {
        Args: {
          query_embedding: string
          match_threshold: number
          match_count: number
        }
        Returns: {
          id: string
          title: string
          content: string
          collection: string
          content_type: string
          similarity: number
        }[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
