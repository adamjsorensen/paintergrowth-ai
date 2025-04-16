
import { MatrixColumn } from "@/types/prompt-templates";

// Update the column type inference to match the new type definition
const getColumnDefinitions = (matrixConfig: any, matrixData: any[]) => {
  if (matrixConfig) {
    return matrixConfig.columns;
  }
  
  // Infer columns from first item
  return inferColumnsFromData(matrixData);
};

// Extract column inference logic to a separate function for better modularity
const inferColumnsFromData = (matrixData: any[]): MatrixColumn[] => {
  if (!matrixData || matrixData.length === 0) {
    return [];
  }
  
  const sampleItem = matrixData[0];
  const columns: MatrixColumn[] = [];
  
  Object.entries(sampleItem).forEach(([key, value]) => {
    if (key !== 'id' && key !== 'label') {
      const type: 'number' | 'checkbox' | 'text' = 
        typeof value === 'number' ? 'number' : 
        typeof value === 'boolean' ? 'checkbox' : 
        'text';
      
      columns.push({ 
        id: key, 
        label: key.charAt(0).toUpperCase() + key.slice(1), 
        type 
      });
    }
  });
  
  return columns;
};

// Export all utility functions
export { 
  getColumnDefinitions,
  inferColumnsFromData
};

// Re-export the utility functions from prompt-templates.ts
export { 
  generatePreviewText,
  stringifyFieldConfig,
  parseFieldConfig,
  isFieldOptionArray,
  isMatrixConfig
} from "@/types/prompt-templates";
