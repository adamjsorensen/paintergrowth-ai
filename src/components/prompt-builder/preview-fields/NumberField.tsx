
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface NumberFieldProps {
  id: string;
  label: string;
  required?: boolean;
  helpText?: string;
  placeholder?: string;
  value: number | string;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

const NumberField: React.FC<NumberFieldProps> = ({
  id,
  label,
  required = false,
  helpText,
  placeholder,
  value,
  onChange,
  min,
  max,
  step,
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={id}
        type="number"
        placeholder={placeholder || ""}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        required={required}
        min={min}
        max={max}
        step={step}
      />
      {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
    </div>
  );
};

export default NumberField;
