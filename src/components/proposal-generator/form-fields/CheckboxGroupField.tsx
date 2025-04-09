
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldConfig } from "@/types/prompt-templates";

interface CheckboxGroupFieldProps {
  field: FieldConfig;
  value: string[];
  onChange: (value: string[]) => void;
}

const CheckboxGroupField = ({ field, value = [], onChange }: CheckboxGroupFieldProps) => {
  const { id, label, required, helpText, options = [] } = field;

  const handleCheckboxChange = (optionValue: string, checked: boolean) => {
    if (checked) {
      onChange([...value, optionValue]);
    } else {
      onChange(value.filter(item => item !== optionValue));
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor={`${id}-group`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 md:grid-cols-3" id={`${id}-group`}>
        {options.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <Checkbox 
              id={`${id}-${option.value}`}
              checked={value.includes(option.value)}
              onCheckedChange={(checked) => handleCheckboxChange(option.value, checked === true)}
            />
            <Label 
              htmlFor={`${id}-${option.value}`} 
              className="text-sm font-normal cursor-pointer"
            >
              {option.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CheckboxGroupField;
