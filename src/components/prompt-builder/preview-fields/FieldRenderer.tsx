import React from "react";
import { FieldConfig, FieldType } from "@/types/prompt-templates";
import TextField from "./TextField";
import TextareaField from "./TextareaField";
import SelectField from "./SelectField";
import NumberField from "./NumberField";
import ToggleField from "./ToggleField";
import DateField from "./DateField";
import CheckboxGroupField from "./CheckboxGroupField";
import MultiSelectField from "./MultiSelectField";
import FileUploadField from "./FileUploadField";
import MatrixField from "./MatrixField";

interface FieldRendererProps {
  field: FieldConfig;
  value: any;
  onChange: (value: any) => void;
}

const FieldRenderer: React.FC<FieldRendererProps> = ({ field, value, onChange }) => {
  const { id, label, type, required, helpText, placeholder, options, min, max, step } = field;
  
  switch (type) {
    case "text":
      return (
        <TextField
          id={id}
          label={label}
          required={required}
          helpText={helpText}
          placeholder={placeholder}
          value={value || ""}
          onChange={onChange}
        />
      );
    
    case "textarea":
      return (
        <TextareaField
          id={id}
          label={label}
          required={required}
          helpText={helpText}
          placeholder={placeholder}
          value={value || ""}
          onChange={onChange}
        />
      );
    
    case "select":
      return (
        <SelectField
          id={id}
          label={label}
          required={required}
          helpText={helpText}
          placeholder={placeholder}
          options={options}
          value={value || ""}
          onChange={onChange}
        />
      );
    
    case "number":
      return (
        <NumberField
          id={id}
          label={label}
          required={required}
          helpText={helpText}
          placeholder={placeholder}
          value={value || ""}
          onChange={onChange}
          min={min}
          max={max}
          step={step}
        />
      );
    
    case "toggle":
      return (
        <ToggleField
          id={id}
          label={label}
          required={required}
          helpText={helpText}
          value={value || false}
          onChange={onChange}
        />
      );
    
    case "date":
      return (
        <DateField
          id={id}
          label={label}
          required={required}
          helpText={helpText}
          value={value || ""}
          onChange={onChange}
        />
      );
    
    case "checkbox-group":
      return (
        <CheckboxGroupField
          id={id}
          label={label}
          required={required}
          helpText={helpText}
          options={options}
          value={Array.isArray(value) ? value : []}
          onChange={onChange}
        />
      );
    
    case "multi-select":
      return (
        <MultiSelectField
          id={id}
          label={label}
          required={required}
          helpText={helpText}
          placeholder={placeholder}
          options={options}
          value={Array.isArray(value) ? value : []}
          onChange={onChange}
        />
      );
    
    case "file-upload":
      return (
        <FileUploadField
          id={id}
          label={label}
          required={required}
          helpText={helpText}
          value={Array.isArray(value) ? value : []}
          onChange={onChange}
        />
      );
    
    case "matrix-selector":
      return (
        <MatrixField
          id={id}
          label={label}
          required={required}
          helpText={helpText}
          value={value || []}
          onChange={onChange}
          options={options}
        />
      );
    
    default:
      return null;
  }
};

export default FieldRenderer;
