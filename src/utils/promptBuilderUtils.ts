
import { FieldConfig, FieldOption, MatrixConfig, MatrixColumn } from "@/types/prompt-templates";
import { stringifyFieldConfig } from "@/types/prompt-templates";
import { supabase } from "@/integrations/supabase/client";

// Interface for matrix items in the form
interface MatrixItem {
  id: string;
  [key: string]: string | number | boolean;
}

/**
 * Process fields to ensure they have the correct structure
 */
export const processFieldConfig = (fields: FieldConfig[]): FieldConfig[] => {
  return fields.map((field, index) => ({
    ...field,
    order: index + 1,
  }));
};

/**
 * Save a prompt template to the database
 */
export const savePromptTemplate = async (templateData: {
  name: string;
  active: boolean;
  system_prompt: string;
  field_config: FieldConfig[];
  id?: string;
}) => {
  const { id, ...data } = templateData;
  
  // Prepare the data for saving
  const saveData = {
    name: data.name,
    active: data.active,
    system_prompt: data.system_prompt,
    field_config: stringifyFieldConfig(data.field_config),
    updated_at: new Date().toISOString(),
  };

  if (id) {
    // Update existing template
    return await supabase
      .from("prompt_templates")
      .update(saveData)
      .eq("id", id);
  } else {
    // Create new template
    return await supabase
      .from("prompt_templates")
      .insert([saveData]);
  }
};

/**
 * Generate preview text by replacing placeholders with field values
 */
export const generatePreviewText = (systemPrompt: string, values: Record<string, any>, fields: FieldConfig[]): string => {
  let preview = systemPrompt;
  
  // Replace all field variables with their values
  Object.entries(values).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, "g");
    
    // Format matrix-selector data specially
    if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
      // Check if this looks like a matrix by sampling some properties
      const sampleObj = value[0];
      if ('id' in sampleObj && Object.keys(sampleObj).some(key => typeof sampleObj[key] === 'boolean')) {
        const formattedMatrix = formatMatrixForPrompt(value as MatrixItem[], fields.find(f => f.name === key));
        preview = preview.replace(regex, formattedMatrix);
      } else {
        const displayValue = Array.isArray(value) ? value.join(", ") : value;
        preview = preview.replace(regex, String(displayValue || `[${key}]`));
      }
    } else {
      const displayValue = Array.isArray(value) ? value.join(", ") : value;
      preview = preview.replace(regex, String(displayValue || `[${key}]`));
    }
  });
  
  // For any fields that haven't been filled, replace with placeholder
  fields.forEach((field) => {
    const regex = new RegExp(`{{${field.id}}}`, "g");
    if (preview.match(regex)) {
      preview = preview.replace(regex, `[${field.id}]`);
    }
  });
  
  return preview;
};

/**
 * Format matrix data into a human-readable format for the prompt
 * @param matrixData Array of row objects with surface selections
 * @param fieldConfig Optional field configuration to provide context
 * @returns Formatted string for use in the proposal
 */
export const formatMatrixForPrompt = (matrixData: MatrixItem[], fieldConfig?: FieldConfig): string => {
  if (!matrixData || !Array.isArray(matrixData) || matrixData.length === 0) {
    return "No rooms selected.";
  }

  // Try to determine the matrix configuration
  let matrixConfig: MatrixConfig | undefined;
  if (fieldConfig && fieldConfig.options && typeof fieldConfig.options === "object" && !Array.isArray(fieldConfig.options) &&
      'rows' in fieldConfig.options && 'columns' in fieldConfig.options) {
    matrixConfig = fieldConfig.options as MatrixConfig;
  }
  
  // Get column definitions or infer them from data
  const getColumnDefinitions = () => {
    if (matrixConfig) {
      return matrixConfig.columns;
    }
    
    // Infer columns from first item
    const sampleItem = matrixData[0];
    const columns: MatrixColumn[] = [];
    
    Object.entries(sampleItem).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'label') {
        const type = typeof value === 'number' ? 'number' : 
                     typeof value === 'boolean' ? 'checkbox' : 'text';
        columns.push({ id: key, type, label: key });
      }
    });
    
    return columns;
  };
  
  const columns = getColumnDefinitions();
  const numericColumns = columns.filter(col => col.type === 'number');
  
  // Filter out rooms based on numeric columns (if any)
  const activeRooms = numericColumns.length > 0 
    ? matrixData.filter(room => numericColumns.some(col => (room[col.id] as number) > 0))
    : matrixData;
  
  if (activeRooms.length === 0) {
    return "No rooms selected.";
  }
  
  let result = "Room Selection Details:\n\n";
  
  activeRooms.forEach(room => {
    // Skip rooms with no selections
    const checkboxColumns = columns.filter(col => col.type === 'checkbox');
    const hasSelections = checkboxColumns.some(col => Boolean(room[col.id]));
    
    // If there's a quantity column specifically
    const qtyColumn = columns.find(col => col.id.toLowerCase() === 'quantity' || col.id.toLowerCase() === 'qty');
    const quantity = qtyColumn ? (room[qtyColumn.id] as number) : 1;
    
    // Only show rooms with selections or positive quantity
    if (!hasSelections && (!qtyColumn || quantity <= 0)) {
      return;
    }
    
    // Get room name
    const roomName = room.label || room.id;
    const quantityText = quantity && quantity > 1 ? `${quantity} ${roomName}s` : roomName;
    result += `- ${quantityText}: `;
    
    // List selected options
    const selections = [];
    checkboxColumns.forEach(col => {
      if (Boolean(room[col.id])) {
        selections.push(col.label);
      }
    });
    
    result += selections.join(", ");
    result += "\n";
  });
  
  return result;
};
