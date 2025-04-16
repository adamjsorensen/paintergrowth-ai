
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
  | 'tax-calculator'
  | 'matrix-selector';

export interface FieldOption {
  value: string;
  label: string;
}

export interface QuoteItem {
  id: string;
  service: string;
  price: string | number;
  notes?: string;
}

export interface UpsellItem {
  id: string;
  service: string;
  price: string | number;
  included: boolean;
  // These properties are used in the UpsellTableField component
  label?: string;
  description?: string;
}

export interface TaxSettings {
  rate: number;
  enabled: boolean;
  // These properties are used in the TaxCalculatorField component
  includeTax?: boolean;
  taxRate?: number;
}

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

export interface FieldConfig {
  id: string;
  name?: string;
  label: string;
  type: FieldType;
  required?: boolean;
  helpText?: string;
  placeholder?: string;
  options?: FieldOption[];
  min?: number;
  max?: number;
  step?: number;
  order: number;
  sectionId?: string;
  complexity?: 'basic' | 'advanced';
}

export interface PromptTemplate {
  id: string;
  name: string;
  system_prompt: string;
  field_config: FieldConfig[] | string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export const parseFieldConfig = (fieldConfig: string | FieldConfig[]): FieldConfig[] => {
  if (typeof fieldConfig === 'string') {
    try {
      return JSON.parse(fieldConfig);
    } catch (error) {
      console.error('Error parsing field config', error);
      return [];
    }
  }
  return fieldConfig;
};

export const stringifyFieldConfig = (fieldConfig: FieldConfig[]): string => {
  return JSON.stringify(fieldConfig);
};
