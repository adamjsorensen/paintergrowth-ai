
import React from "react";
import { FieldConfig } from "@/types/prompt-templates";
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

interface FormFieldRendererProps {
  field: FieldConfig;
  value: any;
  onChange: (value: any) => void;
  readOnly?: boolean;
  isAdvanced?: boolean;
}

const FormFieldRenderer: React.FC<FormFieldRendererProps> = ({ 
  field, 
  value, 
  onChange, 
  readOnly = false,
  isAdvanced = false
}) => {
  const { type, id } = field;

  switch (type) {
    case "text":
      return <TextField field={field} value={value} onChange={onChange} readOnly={readOnly} />;
    
    case "textarea":
      return <TextareaField field={field} value={value} onChange={onChange} readOnly={readOnly} />;
    
    case "number":
      return <NumberField field={field} value={value} onChange={onChange} readOnly={readOnly} />;
    
    case "select":
      return <SelectField field={field} value={value} onChange={onChange} readOnly={readOnly} />;
    
    case "toggle":
      return <ToggleField field={field} value={value} onChange={onChange} readOnly={readOnly} />;
    
    case "checkbox-group":
      return <CheckboxGroupField field={field} value={value} onChange={onChange} readOnly={readOnly} />;
    
    case "multi-select":
      return <MultiSelectField field={field} value={value} onChange={onChange} readOnly={readOnly} />;
    
    case "date":
      return <DatePickerField field={field} value={value} onChange={onChange} readOnly={readOnly} />;
    
    case "file-upload":
      return <FileUploadField field={field} value={value} onChange={onChange} readOnly={readOnly} />;
    
    case "quote-table":
      return <QuoteTableField field={field} value={value} onChange={onChange} readOnly={readOnly} isAdvanced={isAdvanced} />;
    
    case "upsell-table":
      return <UpsellTableField field={field} value={value} onChange={onChange} readOnly={readOnly} isAdvanced={isAdvanced} />;
    
    case "tax-calculator":
      return <TaxCalculatorField field={field} value={value} onChange={onChange} readOnly={readOnly} />;
    
    case "matrix-selector":
      return <MatrixSelectorField 
        field={field} 
        value={value} 
        onChange={onChange}
        readOnly={readOnly}
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
