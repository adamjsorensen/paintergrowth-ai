
import { TeamSizeOptions, ToneOptions } from "@/types/supabase";

export type CompanyProfileFormValues = {
  business_name: string;
  location: string;
  services_offered: string;
  team_size: TeamSizeOptions;
  pricing_notes: string;
  preferred_tone: ToneOptions;
  brand_keywords: string[];
  currentKeyword: string;
};

// Define a proper type for updating the company profile
export interface CompanyProfileUpdate {
  user_id: string; // Mark as required
  business_name?: string;
  location?: string;
  services_offered?: string;
  team_size?: TeamSizeOptions;
  pricing_notes?: string;
  preferred_tone?: ToneOptions;
  brand_keywords?: string[];
  logo_url?: string | null;
}
