
export type BoilerplateType = 'terms_conditions' | 'warranty' | 'invoice_note';

export interface BoilerplateText {
  id: string;
  type: BoilerplateType;
  content: string;
  version: number;
  locale: string;
  updated_at: string;
}

export interface PlaceholderDefault {
  placeholder: string;
  default_value: string;
}

// Interface for merged content result
export interface MergedContent {
  content: string;
  resolvedPlaceholders: Map<string, string>;
  unresolvedPlaceholders: string[];
}
