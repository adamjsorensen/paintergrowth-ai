
import { Database } from "@/integrations/supabase/types";

// Type-safe database interfaces
export type CompanyProfile = Database["public"]["Tables"]["company_profiles"]["Row"];
export type CompanyProfileInsert = Database["public"]["Tables"]["company_profiles"]["Insert"];
export type CompanyProfileUpdate = Database["public"]["Tables"]["company_profiles"]["Update"];

export type AISettings = Database["public"]["Tables"]["ai_settings"]["Row"];
export type AISettingsInsert = Database["public"]["Tables"]["ai_settings"]["Insert"];
export type AISettingsUpdate = Database["public"]["Tables"]["ai_settings"]["Update"];

export type Document = Database["public"]["Tables"]["documents"]["Row"];
export type DocumentInsert = Database["public"]["Tables"]["documents"]["Insert"];
export type DocumentUpdate = Database["public"]["Tables"]["documents"]["Update"];

export type SavedProposal = Database["public"]["Tables"]["saved_proposals"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type PromptTemplate = Database["public"]["Tables"]["prompt_templates"]["Row"];

export type ToneOptions = "friendly" | "professional" | "casual" | "technical" | "funny";
export type TeamSizeOptions = "1" | "2-5" | "6-10" | "11-20" | "21-50" | "51+";
export type ContentTypeOptions = "faq" | "template" | "terminology";
export type CollectionOptions = "general" | "proposal" | "user";

// Model options
export type ModelOptions = "gpt-4o-mini" | "gpt-3.5-turbo" | "gpt-4o";
