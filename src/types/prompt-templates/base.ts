
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

export type FieldType = 
  | "text"
  | "textarea"
  | "quote-table"
  | "upsell-table"
  | "number"
  | "select"
  | "toggle"
  | "checkbox-group"
  | "multi-select"
  | "date"
  | "file-upload"
  | "tax-calculator"
  | "matrix-selector"
  | "scope-of-work";

export type ModalStepType = 'style' | 'scope' | 'main';

export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldConfig {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  complexity?: 'basic' | 'advanced';
  order: number;
  helpText?: string;
  placeholder?: string;
  options?: FieldOption[] | any; // Allow for matrix config or simple options
  sectionId?: string;
  modalStep?: ModalStepType;
}
