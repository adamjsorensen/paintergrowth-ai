/**
 * Matrix field specific types
 */

// Matrix specific types
export interface MatrixRow {
  id: string;
  label: string;
}

export interface MatrixColumn {
  id: string;
  label: string;
  type: 'number' | 'checkbox' | 'text';
  tooltip?: string; // Optional tooltip text for the column header/label
}

export interface MatrixGroup {
  id: string;
  label: string;
  rowIds: string[];
}

export interface MatrixConfig {
  type: 'matrix-config'; // Discriminator for type guards
  rows: MatrixRow[];
  columns: MatrixColumn[];
  groups?: MatrixGroup[];
  quantityColumnId?: string; // Optional: Specify which column controls quantity for +/- buttons
}

// Helper function to create a default matrix configuration
export const createDefaultMatrixConfig = (): MatrixConfig => ({
  type: 'matrix-config',
  rows: [{ id: 'row1', label: 'Row 1' }],
  columns: [{ id: 'col1', label: 'Column 1', type: 'checkbox' }]
});

// Type guard to check if an object is a MatrixConfig
export const isMatrixConfig = (obj: any): obj is MatrixConfig => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'rows' in obj &&
    'columns' in obj &&
    Array.isArray(obj.rows) &&
    Array.isArray(obj.columns)
  );
};

// Validation function for matrix configurations
export const validateMatrixConfig = (config: any): boolean => {
  if (!isMatrixConfig(config)) return false;
  
  // Ensure we have at least one row and one column
  return config.rows.length > 0 && config.columns.length > 0;
};