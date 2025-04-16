/**
 * Core types for the prompt template system
 */

// Basic field option type
export interface FieldOption {
  value: string;
  label: string;
}

// Matrix specific types
export interface MatrixRow {
  id: string;
  label: string;
}

export interface MatrixColumn {
  id: string;
  label: string;
  type: 'number' | 'checkbox' | 'text';
}

export interface MatrixConfig {
  rows: MatrixRow[];
  columns: MatrixColumn[];
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

// For tax calculator fields - updated to match the actual implementation
export interface TaxSettings {
  rate: number;
  enabled?: boolean; // Added this to match how it's actually used
  applyToMaterials?: boolean;
  applyToLabor?: boolean;
}

// For quote table fields - updated to match implementation in QuoteTableField.tsx
export interface QuoteItem {
  id: string;
  service: string; // Changed from description to match implementation
  price: number; // Added to match how it's being used
  notes?: string; // Added to match how it's being used
  
  // Making the original fields optional to maintain compatibility
  description?: string;
  quantity?: number;
  unit?: string;
  unitPrice?: number;
  total?: number;
}

// Add UpsellItem type definition
export interface UpsellItem {
  id: string;
  service: string;
  price: number;
  included?: boolean;
  label?: string;
  description?: string;
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

// Utility functions for working with fields
export const isFieldOptionArray = (options: any): options is FieldOption[] => {
  return Array.isArray(options) && 
    options.length > 0 && 
    typeof options[0] === 'object' && 
    'value' in options[0] && 
    'label' in options[0];
};

export const isMatrixConfig = (options: any): options is MatrixConfig => {
  return typeof options === 'object' && 
    options !== null && 
    !Array.isArray(options) &&
    'rows' in options && 
    'columns' in options;
};

// Helper for saving field config to JSON
export const stringifyFieldConfig = (fields: FieldConfig[]): string => {
  return JSON.stringify(fields);
};

// Helper for parsing field config from JSON string
export const parseFieldConfig = (configStr: string): FieldConfig[] => {
  try {
    if (!configStr) return [];
    return JSON.parse(configStr);
  } catch (e) {
    console.error('Error parsing field config:', e);
    return [];
  }
};

// Helper function to generate preview text based on template and values
export const generatePreviewText = (
  template: string,
  values: Record<string, any>,
  fields: FieldConfig[]
): string => {
  let result = template;

  // Replace each field placeholder with its value
  fields.forEach((field) => {
    const value = values[field.name];
    if (value !== undefined) {
      let displayValue: string;

      if (Array.isArray(value)) {
        if (field.type === 'matrix-selector') {
          // Format matrix data specially
          displayValue = formatMatrixData(value);
        } else {
          // Format arrays as comma-separated list
          displayValue = value.join(', ');
        }
      } else if (typeof value === 'boolean') {
        displayValue = value ? 'Yes' : 'No';
      } else if (value === null || value === '') {
        displayValue = '[Not provided]';
      } else {
        displayValue = String(value);
      }

      const placeholder = new RegExp(`{{\\s*${field.name}\\s*}}`, 'g');
      result = result.replace(placeholder, displayValue);
    }
  });

  return result;
};

// Helper function to format matrix data
const formatMatrixData = (matrixData: any[]): string => {
  if (!matrixData || matrixData.length === 0) return '[No data]';

  return matrixData
    .filter(row => {
      // Filter out rooms with quantity = 0 if quantity exists
      if ('quantity' in row) {
        return row.quantity > 0;
      }
      return true;
    })
    .map(row => {
      const label = row.label || row.id;
      const details = Object.entries(row)
        .filter(([key]) => !['id', 'label'].includes(key))
        .map(([key, value]) => {
          if (typeof value === 'boolean') {
            return value ? key : null;
          }
          return value ? `${key}: ${value}` : null;
        })
        .filter(Boolean)
        .join(', ');

      return `${label}: ${details}`;
    })
    .join('\n');
};
