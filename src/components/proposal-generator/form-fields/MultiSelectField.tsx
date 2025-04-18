
import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Settings, X } from "lucide-react";
import { FieldConfig, FieldOption, isFieldOptionArray } from "@/types/prompt-templates";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
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
  const { id, label, required, helpText, placeholder } = field;
  const [open, setOpen] = useState(false);
  
  // Ensure value is always an array before processing
  const safeValue = Array.isArray(value) ? value : [];
  
  // Ensure options is always defined and an array
  const options = isFieldOptionArray(field.options) ? field.options : [];
  
  const toggleOption = (optionValue: string) => {
    const newValue = safeValue.includes(optionValue)
      ? safeValue.filter(v => v !== optionValue)
      : [...safeValue, optionValue];
    
    onChange(newValue);
  };
  
  const removeOption = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(safeValue.filter(v => v !== optionValue));
  };
  
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
            className={`w-full justify-between ${safeValue.length > 0 ? "h-auto" : "h-10"} ${isAdvanced ? "border-dashed" : ""}`}
          >
            {safeValue.length > 0 ? (
              <div className="flex flex-wrap gap-1 py-1">
                {safeValue.map(item => {
                  const optionLabel = options.find(o => o.value === item)?.label || item;
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
            <CommandList>
              <CommandEmpty>No options found.</CommandEmpty>
              {options && options.length > 0 && (
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => toggleOption(option.value)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          safeValue.includes(option.value) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
    </div>
  );
};

export default MultiSelectField;
