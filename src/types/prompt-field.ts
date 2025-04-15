
import { Json } from '@/integrations/supabase/types';

export type FieldType = 
  | 'text'
  | 'textarea' 
  | 'quote-table'
  | 'upsell-table'
  | 'number'
  | 'select'
  | 'toggle'
  | 'checkbox-group'
  | 'multi-select'
  | 'date'
  | 'file-upload'
  | 'tax-calculator';

export type SectionType = 
  | 'client'
  | 'estimator'
  | 'scope'
  | 'pricing'
  | 'tone'
  | 'colors'
  | 'notes'
  | 'terms'
  | 'warranty'
  | 'meta'
  | 'additional';

export type ComplexityLevel = 'basic' | 'advanced';

export interface FieldOption {
  label: string;
  value: string;
}

export interface PromptField {
  id: string;
  name: string;
  label: string;
  help_text?: string;
  placeholder?: string;
  type: FieldType;
  section: SectionType;
  required: boolean;
  complexity: ComplexityLevel;
  order_position: number;
  prompt_snippet?: string;
  active: boolean;
  options?: FieldOption[] | null;
  created_at: string;
  updated_at: string;
}

// Helper function to parse JSON options from Supabase to FieldOption[]
export function parseFieldOptions(options: Json | null | undefined): FieldOption[] {
  if (!options) return [];
  
  try {
    // Case 1: If options is already an array of FieldOption objects
    if (Array.isArray(options)) {
      // Type cast the array to any[] first to avoid direct type errors
      return (options as any[]).map(opt => {
        if (typeof opt === 'object' && opt !== null && 'label' in opt && 'value' in opt) {
          return {
            label: String(opt.label),
            value: String(opt.value)
          };
        }
        // Default values if structure doesn't match
        return { label: 'Unknown', value: 'unknown' };
      });
    }
    
    // Case 2: If options is a JSON object with an "options" property (from our DB structure)
    if (typeof options === 'object' && options !== null && 'options' in options) {
      const optionsArray = (options as {options: any}).options;
      if (Array.isArray(optionsArray)) {
        return optionsArray.map(opt => {
          if (typeof opt === 'object' && opt !== null && 'label' in opt && 'value' in opt) {
            return {
              label: String(opt.label),
              value: String(opt.value)
            };
          }
          // Default values if structure doesn't match
          return { label: 'Unknown', value: 'unknown' };
        });
      }
    }
    
    return [];
  } catch (error) {
    console.error("Error parsing field options:", error);
    return [];
  }
}
