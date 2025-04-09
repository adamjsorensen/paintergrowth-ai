
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { FieldConfig } from "@/types/prompt-templates";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MultiSelectFieldProps {
  field: FieldConfig;
  value: string[];
  onChange: (value: string[]) => void;
}

const MultiSelectField = ({ field, value = [], onChange }: MultiSelectFieldProps) => {
  const { id, label, required, helpText, placeholder, options = [] } = field;
  const [open, setOpen] = useState(false);

  const handleSelect = (selectedValue: string) => {
    const isSelected = value.includes(selectedValue);
    if (isSelected) {
      onChange(value.filter((item) => item !== selectedValue));
    } else {
      onChange([...value, selectedValue]);
    }
  };

  const handleRemove = (selectedValue: string) => {
    onChange(value.filter((item) => item !== selectedValue));
  };

  const selectedLabels = options
    .filter((option) => value.includes(option.value))
    .map((option) => option.label);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between min-h-10",
              !value.length && "text-muted-foreground"
            )}
          >
            {value.length > 0
              ? `${value.length} selected`
              : placeholder || "Select options..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search options..." />
            <CommandEmpty>No options found.</CommandEmpty>
            <CommandList>
              <CommandGroup>
                {options.map((option) => {
                  const isSelected = value.includes(option.value);
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => handleSelect(option.value)}
                      className="flex items-center justify-between"
                    >
                      <span>{option.label}</span>
                      {isSelected && <Check className="h-4 w-4 opacity-100" />}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {options
            .filter((option) => value.includes(option.value))
            .map((option) => (
              <Badge
                key={option.value}
                variant="secondary"
                className="flex items-center gap-1 px-2 py-0.5"
              >
                {option.label}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => handleRemove(option.value)}
                />
              </Badge>
            ))}
        </div>
      )}

      {helpText && <p className="text-xs text-gray-500 mt-1">{helpText}</p>}
    </div>
  );
};

export default MultiSelectField;
