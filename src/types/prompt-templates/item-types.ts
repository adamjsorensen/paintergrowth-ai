
/**
 * Types for specific field data structures
 */

// For tax calculator fields
export interface TaxSettings {
  rate: number;
  enabled?: boolean;
  applyToMaterials?: boolean;
  applyToLabor?: boolean;
}

// For quote table fields
export interface QuoteItem {
  id: string;
  service: string;
  price: number;
  notes?: string;
  selected?: boolean;  // Added this field
  
  // Making the original fields optional to maintain compatibility
  description?: string;
  quantity?: number;
  unit?: string;
  unitPrice?: number;
  total?: number;
}

// For upsell items
export interface UpsellItem {
  id: string;
  service: string;
  price: number;
  included?: boolean;
  label?: string;
  description?: string;
}

// For scope of work items
export interface ScopeOfWorkItem {
  id: string;
  service: string;
  description?: string;
  price: number;
}
