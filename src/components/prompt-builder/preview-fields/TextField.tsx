
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface TextFieldProps {
  id: string;
  label: string;
  required?: boolean;
  helpText?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

const TextField: React.FC<TextFieldProps> = ({
  id,
  label,
  required = false,
  helpText,
  placeholder,
  value,
  onChange,
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={id}
        placeholder={placeholder || ""}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
      {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
    </div>
  );
};

export default TextField;
