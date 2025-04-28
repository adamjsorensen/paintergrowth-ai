
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
  /**
   * This field now stores a company profile field key rather than a literal default value.
   * The actual default value will be resolved from the user's company profile at runtime.
   * For example, "business_name" refers to the business_name field in the company profile.
   */
  default_value: string;
}

// Interface for merged content result
export interface MergedContent {
  content: string;
  resolvedPlaceholders: Map<string, string>;
  unresolvedPlaceholders: string[];
}