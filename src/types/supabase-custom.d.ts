
// Define additional types for our custom Supabase tables
import { Database as OriginalDatabase } from "@/integrations/supabase/types";

// Extend the Database type with our new tables
export interface ExtendedDatabase extends OriginalDatabase {
  public: {
    Tables: {
      // Include original tables from the generated types
      ...OriginalDatabase['public']['Tables'],
      
      // Add custom tables
      company_profiles: {
        Row: {
          user_id: string;
          business_name: string | null;
          location: string | null;
          services_offered: string | null;
          team_size: string | null;
          pricing_notes: string | null;
          preferred_tone: string | null;
          brand_keywords: string[] | null;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          business_name?: string | null;
          location?: string | null;
          services_offered?: string | null;
          team_size?: string | null;
          pricing_notes?: string | null;
          preferred_tone?: string | null;
          brand_keywords?: string[] | null;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          business_name?: string | null;
          location?: string | null;
          services_offered?: string | null;
          team_size?: string | null;
          pricing_notes?: string | null;
          preferred_tone?: string | null;
          brand_keywords?: string[] | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "company_profiles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      
      ai_settings: {
        Row: {
          id: string;
          model: string;
          temperature: number;
          max_tokens: number;
          default_system_prompt: string | null;
          default_user_prompt: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          model?: string;
          temperature?: number;
          max_tokens?: number;
          default_system_prompt?: string | null;
          default_user_prompt?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          model?: string;
          temperature?: number;
          max_tokens?: number;
          default_system_prompt?: string | null;
          default_user_prompt?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      
      documents: {
        Row: {
          id: string;
          title: string;
          content: string;
          embedding: number[] | null;
          collection: string;
          content_type: string;
          created_at: string;
          metadata: Record<string, any> | null;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          embedding?: number[] | null;
          collection: string;
          content_type: string;
          created_at?: string;
          metadata?: Record<string, any> | null;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          embedding?: number[] | null;
          collection?: string;
          content_type?: string;
          created_at?: string;
          metadata?: Record<string, any> | null;
        };
        Relationships: [];
      };
    };
    
    // Keep other original database properties
    Views: OriginalDatabase['public']['Views'];
    Functions: OriginalDatabase['public']['Functions'];
    Enums: OriginalDatabase['public']['Enums'];
    CompositeTypes: OriginalDatabase['public']['CompositeTypes'];
  };
}
