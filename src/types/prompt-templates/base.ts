
/**
 * Basic field types and options
 */

// Basic field option type
export interface FieldOption {
  value: string;
  label: string;
}

// Field types supported by the system
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

// Core field configuration
export interface FieldConfig {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  order: number;
  sectionId: string;
  required?: boolean;
  complexity?: 'basic' | 'advanced';
  helpText?: string;
  placeholder?: string;
  options?: FieldOption[] | MatrixConfig;
  min?: number;
  max?: number;
  step?: number;
}

// Prompt template definition
export interface PromptTemplate {
  id: string;
  name: string;
  system_prompt: string;
  active: boolean;
  field_config: FieldConfig[];
  created_at: string;
  updated_at: string;
}

// Import matrix types to avoid circular dependencies
import { MatrixConfig } from './matrix';
