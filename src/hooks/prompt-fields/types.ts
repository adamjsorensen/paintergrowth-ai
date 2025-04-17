
import { Json } from "@/integrations/supabase/types";
import { SectionType } from "@/types/prompt-field";
import { FieldType, ModalStepType } from "@/types/prompt-templates";

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
