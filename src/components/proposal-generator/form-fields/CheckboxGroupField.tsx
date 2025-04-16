
import { useState } from "react";
import { FieldConfig, FieldOption, isFieldOptionArray } from "@/types/prompt-templates";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Settings } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CheckboxGroupFieldProps {
  field: FieldConfig;
  value: string[];
  onChange: (value: string[]) => void;
  isAdvanced?: boolean;
}

const CheckboxGroupField = ({ field, value, onChange, isAdvanced = false }: CheckboxGroupFieldProps) => {
  const { id, label, required, helpText, options } = field;
  
  const handleCheckboxChange = (checked: boolean, optionValue: string) => {
    if (checked) {
      onChange([...value, optionValue]);
    } else {
      onChange(value.filter(item => item !== optionValue));
    }
  };

  // Get field options safely
  const fieldOptions = isFieldOptionArray(options) ? options : [];

  return (
    <div className="space-y-2" key={id}>
      <div className="flex items-center gap-1 group">
        <Label className="inline-flex">
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
      
      <div className={`grid grid-cols-2 gap-2 ${isAdvanced ? "border border-dashed rounded-md p-3" : ""}`}>
        {fieldOptions.map((option: FieldOption) => (
          <div key={option.value} className="flex items-center space-x-2">
            <Checkbox
              id={`${id}-${option.value}`}
              checked={value.includes(option.value)}
              onCheckedChange={(checked) => {
                handleCheckboxChange(checked as boolean, option.value);
              }}
            />
            <Label htmlFor={`${id}-${option.value}`} className="text-sm font-normal">
              {option.label}
            </Label>
          </div>
        ))}
      </div>
      
      {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
    </div>
  );
};

export default CheckboxGroupField;
