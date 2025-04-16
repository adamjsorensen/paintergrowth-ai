
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
}

export interface MatrixGroup {
  id: string;
  label: string;
  rowIds: string[];
}

export interface MatrixConfig {
  rows: MatrixRow[];
  columns: MatrixColumn[];
  groups?: MatrixGroup[];
}
