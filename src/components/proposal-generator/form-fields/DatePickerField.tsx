
import { FieldConfig } from "@/types/prompt-templates";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Settings } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DatePickerFieldProps {
  field: FieldConfig;
  value: string;
  onChange: (value: string) => void;
  isAdvanced?: boolean;
}

const DatePickerField = ({ field, value, onChange, isAdvanced = false }: DatePickerFieldProps) => {
  const { id, label, required, helpText } = field;
  
  return (
    <div className="space-y-2" key={id}>
      <div className="flex items-center gap-1 group">
        <Label htmlFor={id} className="inline-flex">
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
      
      <Input
        id={id}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={isAdvanced ? "border-dashed" : ""}
      />
      
      {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
    </div>
  );
};

export default DatePickerField;
