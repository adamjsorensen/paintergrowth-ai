
/**
 * Utility functions for working with prompt template types
 */

import { FieldConfig, FieldOption } from './base';
import { MatrixConfig } from './matrix';

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

// Validate matrix configuration
export const validateMatrixConfig = (config: any): boolean => {
  if (!isMatrixConfig(config)) return false;
  
  // Check for at least one row and one column
  return Array.isArray(config.rows) && 
         config.rows.length > 0 && 
         Array.isArray(config.columns) && 
         config.columns.length > 0;
};

// Create default matrix config for fallbacks
export const createDefaultMatrixConfig = (): MatrixConfig => {
  return {
    type: 'matrix-config',
    rows: [
      { id: "bedroom", label: "Bedroom" },
      { id: "kitchen", label: "Kitchen" }
    ],
    columns: [
      { id: "quantity", label: "Qty", type: "number" },
      { id: "walls", label: "Walls", type: "checkbox" }
    ]
  };
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
