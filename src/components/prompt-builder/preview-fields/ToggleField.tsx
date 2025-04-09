
import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface ToggleFieldProps {
  id: string;
  label: string;
  required?: boolean;
  helpText?: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

const ToggleField: React.FC<ToggleFieldProps> = ({
  id,
  label,
  required = false,
  helpText,
  value,
  onChange,
}) => {
  return (
    <div className="flex justify-between items-center space-x-2 py-2">
      <div>
        <Label htmlFor={id}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
      </div>
      <Switch
        id={id}
        checked={value}
        onCheckedChange={onChange}
      />
    </div>
  );
};

export default ToggleField;
