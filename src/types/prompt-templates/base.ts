import { LineItem } from "./line-item";

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  type: 'prompt-template';
  prompt: string;
  model: string;
  temperature: number;
  max_tokens: number;
  output_format: 'text' | 'json';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  version: number;
  input_fields: InputField[];
  output_fields: OutputField[];
  matrix_config?: MatrixConfig;
  line_item_config?: LineItemConfig;
}

export interface InputField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox';
  required: boolean;
  options?: string[];
}

export interface OutputField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox';
}

export interface MatrixConfig {
  type: 'matrix-config';
  columns: MatrixColumn[];
  rows: MatrixRow[];
  groups: MatrixGroup[];
}

export interface MatrixColumn {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox';
}

export interface MatrixRow {
  id: string;
  label: string;
  group?: string;
  floor?: 'main' | 'upstairs' | 'basement';
}

export interface MatrixGroup {
  id: string;
  label: string;
  rowIds: string[];
}

export interface LineItemConfig {
  type: 'line-item-config';
  fields: LineItemField[];
}

export interface LineItemField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox';
}

export interface PromptTemplateVersion {
  id: string;
  name: string;
  description: string;
  prompt: string;
  model: string;
  temperature: number;
  max_tokens: number;
  output_format: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  version: number;
  input_fields: InputField[];
  output_fields: OutputField[];
  matrix_config?: MatrixConfig;
  line_item_config?: LineItemConfig;
}
