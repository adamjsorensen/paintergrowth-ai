
export type FieldType = 
  | 'text'
  | 'textarea' 
  | 'quote-table'
  | 'upsell-table'
  | 'number'
  | 'select'
  | 'toggle'
  | 'checkbox-group'
  | 'multi-select'
  | 'date'
  | 'file-upload';

export type SectionType = 
  | 'client'
  | 'estimator'
  | 'scope'
  | 'pricing'
  | 'tone'
  | 'colors'
  | 'notes'
  | 'terms'
  | 'warranty'
  | 'meta';

export type ComplexityLevel = 'basic' | 'advanced';

export interface FieldOption {
  label: string;
  value: string;
}

export interface PromptField {
  id: string;
  name: string;
  label: string;
  help_text?: string;
  placeholder?: string;
  type: FieldType;
  section: SectionType;
  required: boolean;
  complexity: ComplexityLevel;
  order_position: number;
  prompt_snippet?: string;
  active: boolean;
  options?: FieldOption[];
  created_at: string;
  updated_at: string;
}
