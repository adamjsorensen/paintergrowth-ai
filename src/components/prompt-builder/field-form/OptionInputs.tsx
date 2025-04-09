
import React from "react";
import { FieldOption } from "@/types/prompt-templates";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormLabel } from "@/components/ui/form";
import { Plus } from "lucide-react";

interface OptionInputsProps {
  options: FieldOption[];
  optionInput: { value: string; label: string };
  setOptionInput: React.Dispatch<React.SetStateAction<{ value: string; label: string }>>;
  onAddOption: () => void;
  onRemoveOption: (index: number) => void;
}

const OptionInputs: React.FC<OptionInputsProps> = ({
  options,
  optionInput,
  setOptionInput,
  onAddOption,
  onRemoveOption,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <FormLabel>Options</FormLabel>
      </div>

      <div className="space-y-2">
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input value={option.value} disabled className="w-1/3" />
            <Input value={option.label} disabled className="w-1/3" />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onRemoveOption(index)}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <FormLabel className="block mb-2">Value</FormLabel>
          <Input
            value={optionInput.value}
            onChange={(e) => setOptionInput({ ...optionInput, value: e.target.value })}
            placeholder="option_value"
          />
        </div>
        <div className="flex-1">
          <FormLabel className="block mb-2">Label</FormLabel>
          <Input
            value={optionInput.label}
            onChange={(e) => setOptionInput({ ...optionInput, label: e.target.value })}
            placeholder="Option Label"
          />
        </div>
        <Button
          type="button"
          size="sm"
          onClick={onAddOption}
          className="mb-[1px]"
        >
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>
    </div>
  );
};

export default OptionInputs;
