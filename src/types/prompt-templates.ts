
import { Json } from "@/integrations/supabase/types";

export type FieldType = 'text' | 'textarea' | 'select' | 'number' | 'toggle' | 'date' | 'checkbox-group' | 'multi-select' | 'file-upload';

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
  sectionId?: string; // Added to group fields into sections
  icon?: string; // Added for field icons
  colSpan?: 'full' | 'half'; // Added for layout control
  complexity: 'basic' | 'advanced'; // Added for streamlined vs. advanced mode
}

export interface FormSection {
  id: string;
  title: string;
  order: number;
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
      const parsed = JSON.parse(jsonData);
      // Add complexity if not present (backward compatibility)
      return parsed.map((field: any) => ({
        ...field,
        complexity: field.complexity || 'basic'
      }));
    }
    
    // Add complexity if not present (backward compatibility)
    const fields = jsonData as unknown as FieldConfig[];
    return fields.map(field => ({
      ...field,
      complexity: field.complexity || 'basic'
    }));
  } catch (error) {
    console.error("Error parsing field_config:", error);
    return [];
  }
};

export const stringifyFieldConfig = (fieldConfig: FieldConfig[]): Json => {
  return fieldConfig as unknown as Json;
};
