
import { Json } from "@/integrations/supabase/types";
import { SectionType } from "@/types/prompt-field";

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
  | "tax-calculator"
  | "matrix-selector"
  | "scope-of-work";

export interface PromptField {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  section: SectionType;
  order_position: number;
  required?: boolean;
  complexity?: 'basic' | 'advanced';
  help_text?: string;
  placeholder?: string;
  options?: Json;
  active?: boolean;
  prompt_snippet?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FieldOption {
  value: string;
  label: string;
}

export interface PromptFieldInput {
  name: string;
  label: string;
  type: FieldType;
  section: SectionType;
  order_position?: number;
  required?: boolean;
  complexity?: 'basic' | 'advanced';
  help_text?: string;
  placeholder?: string;
  options?: Json;
  active?: boolean;
  prompt_snippet?: string;
}

export const formatFieldOptions = (options: FieldOption[]): Json => {
  // Cast to unknown first, then to Json to avoid type errors
  return { options } as unknown as Json;
};
