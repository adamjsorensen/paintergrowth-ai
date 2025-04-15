
import { Json } from "@/integrations/supabase/types";

export type FieldType = 
  | "text"
  | "textarea"
  | "quote-table"
  | "upsell-table"
  | "number"
  | "select"
  | "toggle"
  | "checkbox-group"
  | "multi-select"
  | "date"
  | "file-upload"
  | "tax-calculator";

export type SectionType = 
  | "client"
  | "estimator"
  | "scope"
  | "pricing"
  | "tone"
  | "colors"
  | "notes"
  | "terms"
  | "warranty"
  | "meta"
  | "project"
  | "surfaces";

export interface FieldOption {
  label: string;
  value: string;
}

export interface PromptFieldBase {
  name: string;
  label: string;
  type: FieldType;
  section: SectionType;
  order_position: number;
  required?: boolean;
  complexity?: 'basic' | 'advanced';
  help_text?: string;
  placeholder?: string;
  active?: boolean;
  options?: Json;
  prompt_snippet?: string;
}

export interface PromptFieldInput extends PromptFieldBase {
  // Helper method to convert options array to the correct Json format
  formatOptions?: (options: FieldOption[]) => Json;
}

export interface PromptField extends PromptFieldBase {
  id: string;
  created_at?: string;
  updated_at?: string;
}

// Helper function to convert field options to the correct Json format
export const formatFieldOptions = (options: FieldOption[]): Json => {
  if (!options || options.length === 0) return null;
  return { options } as unknown as Json;
};
