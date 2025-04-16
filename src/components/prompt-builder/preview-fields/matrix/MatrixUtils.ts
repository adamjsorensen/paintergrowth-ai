
import { MatrixConfig } from "@/types/prompt-templates";
import { MatrixItem } from "./types";

// Get matrix configuration from options
export const getMatrixConfig = (options?: any): MatrixConfig => {
  // Default configuration if none is provided
  const defaultConfig: MatrixConfig = {
    rows: [
      { id: "kitchen", label: "Kitchen" },
      { id: "living_room", label: "Living Room" },
      { id: "dining_room", label: "Dining Room" },
      { id: "master_bedroom", label: "Master Bedroom" },
      { id: "bathroom", label: "Bathroom" },
      { id: "guest_bedroom", label: "Guest Bedroom" },
      { id: "hallway", label: "Hallway" },
      { id: "garage", label: "Garage" },
      { id: "bonus_room", label: "Bonus Room" }
    ],
    columns: [
      { id: "quantity", label: "Qty", type: "number" },
      { id: "walls", label: "Walls", type: "checkbox" },
      { id: "ceiling", label: "Ceiling", type: "checkbox" },
      { id: "trim", label: "Trim", type: "checkbox" },
      { id: "doors", label: "Doors", type: "checkbox" },
      { id: "closets", label: "Closets", type: "checkbox" }
    ]
  };
  
  // Check if options exist and are in the right format
  if (options && typeof options === "object" && !Array.isArray(options) &&
      'rows' in options && 'columns' in options) {
    return options as MatrixConfig;
  }
  
  return defaultConfig;
};

// Organize rows by groups
export const organizeRows = (matrixConfig: MatrixConfig): Record<string, string[]> => {
  // If no groups defined, just return all rows
  if (!matrixConfig.groups || matrixConfig.groups.length === 0) {
    return { ungrouped: matrixConfig.rows.map(row => row.id) };
  }
  
  // Get rows organized by groups
  const groupedRows: Record<string, string[]> = {};
  
  // First add all defined groups
  matrixConfig.groups.forEach(group => {
    groupedRows[group.id] = group.rowIds;
  });
  
  // Find any rows not in a group
  const allGroupedRowIds = Object.values(groupedRows).flat();
  const ungroupedRowIds = matrixConfig.rows
    .map(row => row.id)
    .filter(id => !allGroupedRowIds.includes(id));
  
  // Add ungrouped rows if any exist
  if (ungroupedRowIds.length > 0) {
    groupedRows.ungrouped = ungroupedRowIds;
  }
  
  return groupedRows;
};

// Initialize the matrix with default values if empty
export const initializeMatrixValue = (value: any[], matrixConfig: MatrixConfig): MatrixItem[] => {
  if (!value || !Array.isArray(value) || value.length === 0) {
    // Create initial value based on the configuration
    return matrixConfig.rows.map(row => {
      const item: MatrixItem = {
        id: row.id,
        label: row.label, // Store the label for display
      };
      
      // Initialize all columns with default values
      matrixConfig.columns.forEach(col => {
        if (col.type === "number") {
          item[col.id] = 1; // Default number value
        } else if (col.type === "checkbox") {
          item[col.id] = false; // Default checkbox value
        }
      });
      
      return item;
    });
  }
  return value;
};

// Get a mapping of row IDs to their corresponding MatrixItem
export const getRowMapping = (matrixValue: MatrixItem[]): Record<string, MatrixItem> => {
  const rowMapping: Record<string, MatrixItem> = {};
  matrixValue.forEach(item => {
    rowMapping[item.id] = item;
  });
  return rowMapping;
};
