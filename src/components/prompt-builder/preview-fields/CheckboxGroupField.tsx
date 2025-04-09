
import React from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldOption } from "@/types/prompt-templates";

interface CheckboxGroupFieldProps {
  id: string;
  label: string;
  required?: boolean;
  helpText?: string;
  options?: FieldOption[];
  value: string[];
  onChange: (value: string[]) => void;
}

const CheckboxGroupField: React.FC<CheckboxGroupFieldProps> = ({
  id,
  label,
  required = false,
  helpText,
  options = [],
  value,
  onChange,
}) => {
  const handleCheckboxChange = (optionValue: string, checked: boolean) => {
    if (checked) {
      onChange([...value, optionValue]);
    } else {
      onChange(value.filter(v => v !== optionValue));
    }
  };

  return (
    <div className="space-y-3">
      <Label>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <Checkbox 
              id={`${id}-${option.value}`}
              checked={value.includes(option.value)}
              onCheckedChange={(checked) => handleCheckboxChange(option.value, checked === true)}
            />
            <Label htmlFor={`${id}-${option.value}`} className="text-sm font-normal">
              {option.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CheckboxGroupField;
