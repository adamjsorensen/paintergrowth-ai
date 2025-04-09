
import React from "react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { FieldOption } from "@/types/prompt-templates";

interface MultiSelectFieldProps {
  id: string;
  label: string;
  required?: boolean;
  helpText?: string;
  placeholder?: string;
  options?: FieldOption[];
  value: string[];
  onChange: (value: string[]) => void;
}

const MultiSelectField: React.FC<MultiSelectFieldProps> = ({
  id,
  label,
  required = false,
  helpText,
  placeholder,
  options = [],
  value,
  onChange,
}) => {
  // Ensure value is always an array
  const safeValue = Array.isArray(value) ? value : [];
  // Ensure options is always defined
  const safeOptions = Array.isArray(options) ? options : [];
  
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Select
        value="placeholder"
        onValueChange={(newValue) => {
          if (!safeValue.includes(newValue)) {
            onChange([...safeValue, newValue]);
          }
        }}
      >
        <SelectTrigger id={id}>
          <SelectValue placeholder={placeholder || "Select options..."} />
        </SelectTrigger>
        <SelectContent>
          {safeOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {(safeValue?.length > 0) && (
        <div className="flex flex-wrap gap-1 mt-2">
          {safeValue.map((selectedValue: string) => {
            const option = safeOptions.find((o) => o.value === selectedValue);
            return (
              <Badge key={selectedValue} variant="secondary" className="px-2 py-1">
                {option?.label || selectedValue}
                <button
                  type="button"
                  className="ml-1"
                  onClick={() => {
                    onChange(safeValue.filter((v: string) => v !== selectedValue));
                  }}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
      {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
    </div>
  );
};

export default MultiSelectField;
