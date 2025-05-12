import React from "react";
import { FieldConfig, MatrixConfig, isMatrixConfig, createDefaultMatrixConfig } from "@/types/prompt-templates";
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

  // Debug logging for matrix fields
  if (type === 'matrix-selector') {
    console.log('FormFieldRenderer - Matrix field:', field);
    console.log('FormFieldRenderer - Matrix value:', value);
    console.log('FormFieldRenderer - Matrix options:', field.options);
    console.log('FormFieldRenderer - isMatrixConfig:', isMatrixConfig(field.options));
  }

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
      // Log the matrix config parsing attempt
      console.log('FormFieldRenderer - Attempting to parse matrix config');
      let matrixConfig: MatrixConfig | undefined;
      
      if (isMatrixConfig(field.options)) {
        console.log('FormFieldRenderer - Using field.options directly as MatrixConfig');
        matrixConfig = field.options;
      } else if (typeof field.options === 'string') {
        try {
          const parsedConfig = JSON.parse(field.options);
          console.log('FormFieldRenderer - Parsed string options:', parsedConfig);
          if (isMatrixConfig(parsedConfig)) {
            matrixConfig = parsedConfig;
          } else {
            console.warn('FormFieldRenderer - Parsed options are not a valid MatrixConfig');
          }
        } catch (error) {
          console.error('FormFieldRenderer - Failed to parse matrix config string:', error);
        }
      }
      
      if (!matrixConfig) {
        console.log('FormFieldRenderer - Using default matrix config');
        matrixConfig = createDefaultMatrixConfig();
      }
      
      return (
        <MatrixSelectorField 
          field={field} 
          value={value || []} 
          onChange={onChange}
          isAdvanced={isAdvanced}
          matrixConfig={matrixConfig}
        />
      );

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