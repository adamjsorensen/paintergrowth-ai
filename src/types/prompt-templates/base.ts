
export interface PromptTemplate {
  id: string;
  name: string;
  template_prompt: string; // Changed from system_prompt
  system_prompt_override?: string; // Added new field
  active: boolean;
  field_config: FieldConfig[];
  created_at: string;
  updated_at: string;
}
