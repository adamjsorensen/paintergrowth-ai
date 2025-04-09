
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

interface FormFieldRendererProps {
  field: FieldConfig;
  value: string | number | boolean | string[];
  onChange: (value: any) => void;
  isAdvanced?: boolean;
}

const FormFieldRenderer = ({ field, value, onChange, isAdvanced }: FormFieldRendererProps) => {
  // Handle different field types with appropriate components
  switch (field.type) {
    case "text":
      return (
        <TextField 
          field={field}
          value={value as string} 
          onChange={onChange}
          isAdvanced={isAdvanced}
        />
      );
      
    case "textarea":
      return (
        <TextareaField 
          field={field}
          value={value as string} 
          onChange={onChange}
          isAdvanced={isAdvanced}
        />
      );
      
    case "select":
      return (
        <SelectField 
          field={field}
          value={value as string} 
          onChange={onChange}
          isAdvanced={isAdvanced}
        />
      );
      
    case "number":
      return (
        <NumberField 
          field={field}
          value={value as number | string} 
          onChange={onChange}
          isAdvanced={isAdvanced}
        />
      );
      
    case "toggle":
      return (
        <ToggleField 
          field={field}
          value={value as boolean} 
          onChange={onChange}
          isAdvanced={isAdvanced}
        />
      );
      
    case "date":
      return (
        <DatePickerField 
          field={field}
          value={value as string} 
          onChange={onChange}
          isAdvanced={isAdvanced}
        />
      );
      
    case "checkbox-group":
      return (
        <CheckboxGroupField 
          field={field}
          value={value as string[]} 
          onChange={onChange}
          isAdvanced={isAdvanced}
        />
      );
      
    case "multi-select":
      return (
        <MultiSelectField 
          field={field}
          value={value as string[]} 
          onChange={onChange}
          isAdvanced={isAdvanced}
        />
      );
      
    case "file-upload":
      return (
        <FileUploadField 
          field={field}
          value={value as string[]} 
          onChange={onChange}
          isAdvanced={isAdvanced}
        />
      );
      
    default:
      return (
        <div className="text-sm text-red-500">
          Unknown field type: {field.type}
        </div>
      );
  }
};

export default FormFieldRenderer;
