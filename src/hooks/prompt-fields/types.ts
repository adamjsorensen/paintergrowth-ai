
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

export type ModalStepType = 'style' | 'scope' | 'main';

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
  modal_step?: ModalStepType;
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
  modal_step?: ModalStepType;
}

export const formatFieldOptions = (options: FieldOption[]): Json => {
  // Cast to unknown first, then to Json to avoid type errors
  return { options } as unknown as Json;
};
