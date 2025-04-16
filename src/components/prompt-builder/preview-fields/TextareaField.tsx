
import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface TextareaFieldProps {
  id: string;
  label: string;
  required?: boolean;
  helpText?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const TextareaField: React.FC<TextareaFieldProps> = ({
  id,
  label,
  required = false,
  helpText,
  placeholder,
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Textarea
        id={id}
        placeholder={placeholder || ""}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
      />
      {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
    </div>
  );
};

export default TextareaField;
