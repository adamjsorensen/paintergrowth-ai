
import { FieldConfig } from "@/types/prompt-templates";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CheckboxGroupField from "./form-fields/CheckboxGroupField";
import MultiSelectField from "./form-fields/MultiSelectField";
import DatePickerField from "./form-fields/DatePickerField";
import FileUploadField from "./form-fields/FileUploadField";
import { Settings } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FormFieldRendererProps {
  field: FieldConfig;
  value: string | number | boolean | string[];
  onChange: (value: string | number | boolean | string[]) => void;
  isAdvanced?: boolean;
}

const FormFieldRenderer = ({ field, value, onChange, isAdvanced = false }: FormFieldRendererProps) => {
  const { id, label, type, required, helpText, placeholder } = field;
  
  // For multi-value fields, ensure value is an array
  const ensureArray = (val: any): string[] => {
    if (Array.isArray(val)) return val;
    return [];
  };

  // Label with advanced indicator if needed
  const FieldLabel = () => (
    <div className="flex items-center gap-1 group">
      <Label htmlFor={id} className="inline-flex">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      {isAdvanced && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-muted-foreground ml-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                <Settings className="h-3 w-3" />
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Advanced option</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
  
  // Ensure field has options if needed
  const options = (field.type === 'select' || field.type === 'multi-select' || field.type === 'checkbox-group') 
    ? (Array.isArray(field.options) ? field.options : []) 
    : field.options;
  
  // Create a field with guaranteed options
  const fieldWithOptions = {
    ...field,
    options
  };
  
  switch (type) {
    case "text":
      return (
        <div className="space-y-2" key={id}>
          <FieldLabel />
          <Input
            id={id}
            placeholder={placeholder || ""}
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            required={required}
            className={isAdvanced ? "border-dashed" : ""}
          />
          {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
        </div>
      );
    
    case "textarea":
      return (
        <div className="space-y-2" key={id}>
          <FieldLabel />
          <Textarea
            id={id}
            placeholder={placeholder || ""}
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            required={required}
            className={isAdvanced ? "border-dashed" : ""}
          />
          {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
        </div>
      );
    
    case "select":
      return (
        <div className="space-y-2" key={id}>
          <FieldLabel />
          <Select
            value={(value as string) || ""}
            onValueChange={(newValue) => onChange(newValue)}
          >
            <SelectTrigger id={id} className={isAdvanced ? "border-dashed" : ""}>
              <SelectValue placeholder={placeholder || "Select an option"} />
            </SelectTrigger>
            <SelectContent>
              {fieldWithOptions.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
        </div>
      );
    
    case "number":
      return (
        <div className="space-y-2" key={id}>
          <FieldLabel />
          <Input
            id={id}
            type="number"
            placeholder={placeholder || ""}
            value={(value as number) || ""}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            required={required}
            min={field.min}
            max={field.max}
            step={field.step}
            className={isAdvanced ? "border-dashed" : ""}
          />
          {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
        </div>
      );
    
    case "toggle":
      return (
        <div className="flex justify-between items-center space-x-2 py-2" key={id}>
          <div>
            <FieldLabel />
            {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
          </div>
          <Switch
            id={id}
            checked={value as boolean || false}
            onCheckedChange={(checked) => onChange(checked)}
            className={isAdvanced ? "data-[state=unchecked]:border-dashed border" : ""}
          />
        </div>
      );
    
    case "date":
      return (
        <DatePickerField 
          field={field} 
          value={value as string} 
          onChange={(val) => onChange(val)} 
          isAdvanced={isAdvanced}
        />
      );
    
    case "checkbox-group":
      return (
        <CheckboxGroupField 
          field={fieldWithOptions} 
          value={ensureArray(value)} 
          onChange={(val) => onChange(val)} 
          isAdvanced={isAdvanced}
        />
      );
    
    case "multi-select":
      return (
        <MultiSelectField 
          field={fieldWithOptions} 
          value={ensureArray(value)} 
          onChange={(val) => onChange(val)} 
          isAdvanced={isAdvanced}
        />
      );
    
    case "file-upload":
      return (
        <FileUploadField 
          field={field} 
          value={ensureArray(value)}
          onChange={(val) => onChange(val)} 
          isAdvanced={isAdvanced}
        />
      );
    
    default:
      return null;
  }
};

export default FormFieldRenderer;
