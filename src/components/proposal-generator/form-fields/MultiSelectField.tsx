
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
  
  // Diagnostic logging for options and value
  useEffect(() => {
    console.log('MultiSelect Component Mounted:', {
      fieldId: id,
      rawFieldOptions: field.options,
      isFieldOptionArray: isFieldOptionArray(field.options),
      rawValue: value,
    });
  }, []);

  // Ensure options is always defined and an array
  const options = isFieldOptionArray(field.options) ? field.options : [];
  
  // Log options for debugging before render
  useEffect(() => {
    console.log('Rendering Command Group:', { 
      optionsExist: options && options.length > 0,
      options 
    });
  }, [options]);
  
  const toggleOption = (optionValue: string) => {
    console.log('Toggle Option Called:', {
      optionValue,
      currentValue: value,
      options: options
    });

    const safeValue = Array.isArray(value) ? value : [];
    
    if (safeValue.includes(optionValue)) {
      console.log('Removing option');
      onChange(safeValue.filter(v => v !== optionValue));
    } else {
      console.log('Adding option');
      onChange([...safeValue, optionValue]);
    }
  };
  
  const removeOption = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const safeValue = Array.isArray(value) ? value : [];
    console.log('Removing specific option:', {
      optionValue,
      currentValue: safeValue
    });
    onChange(safeValue.filter(v => v !== optionValue));
  };
  
  // Ensure value is always an array before processing
  const safeValue = Array.isArray(value) ? value : [];
  
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
            onClick={() => {
              console.log('Popover Trigger Clicked', {
                currentOpenState: open,
                currentValue: safeValue,
                currentOptions: options
              });
              setOpen(!open);
            }}
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
            <CommandEmpty>No options found.</CommandEmpty>
            {/* Only render CommandGroup when options exist - removed console.log from JSX */}
            {options && options.length > 0 && (
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => {
                      console.log('Command Item Selected:', {
                        optionValue: option.value,
                        currentValue: safeValue
                      });
                      toggleOption(option.value);
                    }}
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
          </Command>
        </PopoverContent>
      </Popover>
      
      {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
    </div>
  );
};

export default MultiSelectField;
