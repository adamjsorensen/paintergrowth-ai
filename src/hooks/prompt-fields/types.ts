
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
  | "tax-calculator"
  | "matrix-selector";

export interface PromptField {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  section: string;
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
  section: string;
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

export interface MatrixRow {
  id: string;
  room: string;
  quantity: number;
  walls: boolean;
  ceiling: boolean;
  trim: boolean;
  doors: boolean;
  closets: boolean;
}
