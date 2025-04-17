
import { FieldConfig } from "@/types/prompt-templates";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Settings, AlertCircle, Check } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface TextFieldProps {
  field: FieldConfig;
  value: string;
  onChange: (value: string) => void;
  isAdvanced?: boolean;
}

const TextField = ({ field, value, onChange, isAdvanced = false }: TextFieldProps) => {
  const { id, label, required, helpText, placeholder } = field;
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value && value.trim().length > 0;
  
  return (
    <div className="space-y-3 transition-all duration-200 hover:bg-gray-50/50 p-2 -m-2 rounded-lg" key={id}>
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-1 group">
          <Label 
            htmlFor={id} 
            className={cn(
              "inline-flex font-medium transition-colors",
              isFocused ? "text-blue-600" : "",
              hasValue && !isFocused ? "text-gray-700" : ""
            )}
          >
            {label}
            {required && (
              <span className="ml-1 text-red-600 font-medium inline-flex items-center">
                *
              </span>
            )}
          </Label>
        </div>
        
        <div className="flex items-center gap-2">
          {hasValue && (
            <span className="text-green-500">
              <Check className="h-4 w-4" />
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
      
      <div className="relative">
        <Input
          id={id}
          type="text"
          placeholder={placeholder || ""}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          required={required}
          className={cn(
            "transition-all duration-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-200",
            isAdvanced ? "border-dashed border-gray-300" : "",
            isFocused ? "shadow-sm" : ""
          )}
        />
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

export default TextField;
