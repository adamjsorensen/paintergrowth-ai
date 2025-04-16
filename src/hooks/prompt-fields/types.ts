
import { Json } from "@/integrations/supabase/types";

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
  | "matrix-selector";  // Added matrix-selector to the FieldType
