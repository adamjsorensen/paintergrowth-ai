
import { Json } from "@/integrations/supabase/types";

export type FieldType = 'text' | 'textarea' | 'select' | 'number' | 'toggle' | 'date';

export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldConfig {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  helpText?: string;
  placeholder?: string;
  order: number;
  options?: FieldOption[];
  min?: number;
  max?: number;
  step?: number;
}

export interface PromptTemplate {
  id: string;
  name: string;
  system_prompt: string;
  field_config: FieldConfig[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

// Utility functions to convert between database JSON and typed FieldConfig[]
export const parseFieldConfig = (jsonData: Json): FieldConfig[] => {
  if (!jsonData) return [];
  
  try {
    if (typeof jsonData === 'string') {
      return JSON.parse(jsonData);
    }
    return jsonData as unknown as FieldConfig[];
  } catch (error) {
    console.error("Error parsing field_config:", error);
    return [];
  }
};

export const stringifyFieldConfig = (fieldConfig: FieldConfig[]): Json => {
  return fieldConfig as unknown as Json;
};
