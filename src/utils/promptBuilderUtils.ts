
import { FieldConfig, FieldOption } from "@/types/prompt-templates";
import { stringifyFieldConfig } from "@/types/prompt-templates";
import { supabase } from "@/integrations/supabase/client";

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
    const displayValue = Array.isArray(value) ? value.join(", ") : value;
    preview = preview.replace(regex, String(displayValue || `[${key}]`));
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
