
/**
 * Export all types and utilities from the prompt-templates directory
 */

// Re-export base types
export * from './base';

// Re-export item types
export * from './item-types';

// Selectively re-export from matrix to avoid conflicts
export {
  MatrixRow, 
  MatrixColumn, 
  MatrixGroup, 
  MatrixConfig
} from './matrix';

// Selectively re-export utility functions from utils to avoid conflicts
export {
  isFieldOptionArray,
  stringifyFieldConfig,
  parseFieldConfig,
  generatePreviewText
} from './utils';

// Explicitly re-export the utility functions that had conflicts
export {
  createDefaultMatrixConfig, 
  isMatrixConfig, 
  validateMatrixConfig
} from './matrix';
