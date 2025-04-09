
import { FieldConfig } from "@/types/prompt-templates";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ToggleFieldProps {
  field: FieldConfig;
  value: boolean;
  onChange: (value: boolean) => void;
  isAdvanced?: boolean;
}

const ToggleField = ({ field, value, onChange, isAdvanced = false }: ToggleFieldProps) => {
  const { id, label, required, helpText } = field;
  
  return (
    <div className="flex items-center justify-between space-x-2" key={id}>
      <div className="space-y-0.5">
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
        {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
      </div>
      
      <Switch
        id={id}
        checked={value}
        onCheckedChange={onChange}
        className={isAdvanced ? "data-[state=unchecked]:border-dashed data-[state=checked]:bg-primary" : ""}
      />
    </div>
  );
};

export default ToggleField;
