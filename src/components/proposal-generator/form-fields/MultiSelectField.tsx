
import { useState } from "react";
import { Check, ChevronsUpDown, Settings, X } from "lucide-react";
import { FieldConfig } from "@/types/prompt-templates";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MultiSelectFieldProps {
  field: FieldConfig;
  value: string[];
  onChange: (value: string[]) => void;
  isAdvanced?: boolean;
}

const MultiSelectField = ({ field, value, onChange, isAdvanced = false }: MultiSelectFieldProps) => {
  const { id, label, required, helpText, options, placeholder } = field;
  const [open, setOpen] = useState(false);
  
  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };
  
  const removeOption = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter(v => v !== optionValue));
  };
  
  const selectedLabels = options?.filter(option => 
    value.includes(option.value)
  ).map(option => option.label);

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
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={`w-full justify-between ${value.length > 0 ? "h-auto" : "h-10"} ${isAdvanced ? "border-dashed" : ""}`}
            onClick={() => setOpen(!open)}
          >
            {value.length > 0 ? (
              <div className="flex flex-wrap gap-1 py-1">
                {value.map(item => {
                  const optionLabel = options?.find(o => o.value === item)?.label || item;
                  return (
                    <Badge key={item} variant="secondary" className="mr-1 mb-1">
                      {optionLabel}
                      <button 
                        className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        onMouseDown={e => e.preventDefault()}
                        onClick={e => removeOption(item, e)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            ) : (
              <span className="text-muted-foreground">{placeholder || "Select options..."}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search options..." />
            <CommandEmpty>No options found.</CommandEmpty>
            <CommandGroup>
              {options?.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => toggleOption(option.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.includes(option.value) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      
      {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
    </div>
  );
};

export default MultiSelectField;
