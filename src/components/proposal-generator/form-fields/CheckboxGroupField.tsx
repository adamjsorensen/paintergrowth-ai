
import { useState } from "react";
import { FieldConfig, FieldOption, isFieldOptionArray } from "@/types/prompt-templates";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Settings, AlertCircle, Check } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

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
    <div className="space-y-3 transition-all duration-200 hover:bg-gray-50/50 p-2 -m-2 rounded-lg" key={id}>
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-1 group">
          <Label className="inline-flex font-medium">
            {label}
            {required && (
              <span className="ml-1 relative top-0 text-xs inline-flex items-center justify-center rounded-full bg-red-100 text-red-700 w-4 h-4 font-medium">
                *
              </span>
            )}
          </Label>
        </div>
        
        <div className="flex items-center gap-2">
          {value.length > 0 && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">
              {value.length} selected
            </span>
          )}
          
          {isAdvanced && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-blue-500 opacity-70 hover:opacity-100 transition-opacity">
                    <Settings className="h-4 w-4" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Advanced option</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
      
      <div className={cn(
        "grid grid-cols-1 sm:grid-cols-2 gap-3",
        isAdvanced && "border border-dashed border-blue-200 rounded-md p-3 bg-blue-50/30"
      )}>
        {fieldOptions.map((option: FieldOption) => {
          const isChecked = value.includes(option.value);
          return (
            <Card 
              key={option.value} 
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-md overflow-hidden",
                isChecked 
                  ? "border-blue-500 bg-blue-50" 
                  : "border-gray-200 hover:border-blue-200"
              )}
              onClick={() => handleCheckboxChange(!isChecked, option.value)}
            >
              <div className="flex items-center p-3">
                <div className={cn(
                  "h-5 w-5 rounded-md flex items-center justify-center mr-3 border transition-colors",
                  isChecked 
                    ? "bg-blue-500 border-blue-500 text-white" 
                    : "border-gray-300 bg-white"
                )}>
                  {isChecked && <Check className="h-3 w-3" />}
                </div>
                <Label htmlFor={`${id}-${option.value}`} className="text-sm font-medium cursor-pointer">
                  {option.label}
                </Label>
              </div>
            </Card>
          );
        })}
      </div>
      
      {helpText && (
        <div className="flex items-start gap-1 text-xs text-gray-500">
          <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <p>{helpText}</p>
        </div>
      )}
    </div>
  );
};

export default CheckboxGroupField;
