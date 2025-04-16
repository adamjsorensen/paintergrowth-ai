
import React from "react";
import { FieldConfig, MatrixConfig } from "@/types/prompt-templates";
import TextField from "./form-fields/TextField";
import TextareaField from "./form-fields/TextareaField";
import SelectField from "./form-fields/SelectField";
import NumberField from "./form-fields/NumberField";
import ToggleField from "./form-fields/ToggleField";
import DatePickerField from "./form-fields/DatePickerField";
import CheckboxGroupField from "./form-fields/CheckboxGroupField";
import MultiSelectField from "./form-fields/MultiSelectField";
import FileUploadField from "./form-fields/FileUploadField";
import QuoteTableField from "./form-fields/QuoteTableField";
import UpsellTableField from "./form-fields/UpsellTableField";
import TaxCalculatorField from "./form-fields/TaxCalculatorField";
import MatrixSelectorField from "./form-fields/MatrixSelectorField";
import ScopeOfWorkField from "./form-fields/ScopeOfWorkField";
import { isMatrixConfig } from "@/types/prompt-templates";

export interface FormFieldRendererProps {
  field: FieldConfig;
  value: any;
  onChange: (value: any) => void;
  readOnly?: boolean;
  isAdvanced?: boolean;
  subtotal?: number;
}

const FormFieldRenderer: React.FC<FormFieldRendererProps> = ({ 
  field, 
  value, 
  onChange, 
  readOnly = false,
  isAdvanced = false,
  subtotal
}) => {
  const { type, id } = field;

  switch (type) {
    case "text":
      return <TextField field={field} value={value} onChange={onChange} />;
    
    case "textarea":
      return <TextareaField field={field} value={value} onChange={onChange} />;
    
    case "number":
      return <NumberField field={field} value={value} onChange={onChange} />;
    
    case "select":
      return <SelectField field={field} value={value} onChange={onChange} isAdvanced={isAdvanced} />;
    
    case "toggle":
      return <ToggleField field={field} value={value} onChange={onChange} />;
    
    case "checkbox-group":
      return <CheckboxGroupField field={field} value={value || []} onChange={onChange} isAdvanced={isAdvanced} />;
    
    case "multi-select":
      return <MultiSelectField field={field} value={value || []} onChange={onChange} isAdvanced={isAdvanced} />;
    
    case "date":
      return <DatePickerField field={field} value={value} onChange={onChange} />;
    
    case "file-upload":
      return <FileUploadField field={field} value={value || []} onChange={onChange} />;
    
    case "quote-table":
      return <QuoteTableField field={field} value={value} onChange={onChange} isAdvanced={isAdvanced} />;
    
    case "upsell-table":
      return <UpsellTableField field={field} value={value} onChange={onChange} isAdvanced={isAdvanced} />;
    
    case "tax-calculator":
      return <TaxCalculatorField field={field} value={value} onChange={onChange} subtotal={subtotal} />;
    
    case "matrix-selector":
      return <MatrixSelectorField 
        field={field} 
        value={value || []} 
        onChange={onChange}
        isAdvanced={isAdvanced}
        matrixConfig={isMatrixConfig(field.options) ? field.options : undefined}
      />;

    case "scope-of-work":
      return <ScopeOfWorkField
        field={field}
        value={value || []}
        onChange={onChange}
        isAdvanced={isAdvanced}
      />;
    
    default:
      console.warn(`Unknown field type: ${type}`);
      return <div>Unsupported field type: {type}</div>;
  }
};

export default FormFieldRenderer;
