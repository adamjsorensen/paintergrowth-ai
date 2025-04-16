
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
  [key: string]: boolean | string | number; // Allow dynamic column properties
}

export interface MatrixColumn {
  id: string;
  label: string;
  type: 'number' | 'checkbox';
}

export interface MatrixConfig {
  rows: {
    id: string;
    label: string;
  }[];
  columns: MatrixColumn[];
}

export interface FieldConfig {
  id: string;
  name?: string;
  label: string;
  type: FieldType;
  required?: boolean;
  helpText?: string;
  placeholder?: string;
  options?: FieldOption[] | MatrixConfig;
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

// Utility function to check if options is a MatrixConfig
export const isMatrixConfig = (options: any): options is MatrixConfig => {
  return options && 
    typeof options === 'object' && 
    !Array.isArray(options) &&
    'rows' in options && 
    'columns' in options;
};

// Utility function to check if options is a FieldOption array
export const isFieldOptionArray = (options: any): options is FieldOption[] => {
  return Array.isArray(options) && 
    options.length > 0 && 
    'value' in options[0] && 
    'label' in options[0];
};
