
import React, { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { FieldOption } from "@/types/prompt-templates";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FormSectionFields from "./components/FormSectionFields";
import FieldTypeSection from "./components/FieldTypeSection";
import FieldToggles from "./components/FieldToggles";
import SectionSelect from "./components/SectionSelect";
import OptionInputs from "./OptionInputs";

interface FieldFormProps {
  form: UseFormReturn<any>;
  isEditing: boolean;
  options: FieldOption[];
  setOptions: React.Dispatch<React.SetStateAction<FieldOption[]>>;
  onSubmit: (values: any) => void;
  onCancel: () => void;
}

const FieldForm: React.FC<FieldFormProps> = ({
  form,
  isEditing,
  options,
  setOptions,
  onSubmit,
  onCancel,
}) => {
  console.log("FieldForm rendering - isEditing:", isEditing);
  
  const [optionInput, setOptionInput] = useState<FieldOption>({ value: "", label: "" });
  
  useEffect(() => {
    console.log("FieldForm mounted");
    return () => {
      console.log("FieldForm unmounted");
    };
  }, []);

  const needsOptions = () => {
    const currentType = form.watch("type");
    return ["select", "checkbox-group", "multi-select"].includes(currentType);
  };

  const handleFormSubmit = (values: any) => {
    console.log("FieldForm handleFormSubmit called with values:", values);
    
    try {
      console.log("Calling onSubmit with values");
      onSubmit(values);
      console.log("onSubmit called successfully");
    } catch (error) {
      console.error("Error in handleFormSubmit:", error);
    }
    
    return false;
  };

  const handleAddOption = () => {
    if (optionInput.value && optionInput.label) {
      setOptions([...options, { ...optionInput }]);
      setOptionInput({ value: "", label: "" });
    }
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  return (
    <Card className="my-4">
      <CardContent className="pt-6">
        <form 
          onSubmit={(e) => {
            console.log("Form submit event triggered");
            e.preventDefault();
            form.handleSubmit(handleFormSubmit)(e);
          }} 
          className="space-y-4"
        >
          <FormSectionFields form={form} />
          
          <div className="grid grid-cols-2 gap-4">
            <FieldTypeSection form={form} />
            <SectionSelect form={form} />
          </div>
          
          <FieldToggles form={form} />
          
          {needsOptions() && (
            <OptionInputs 
              options={options}
              optionInput={optionInput}
              setOptionInput={setOptionInput}
              onAddOption={handleAddOption}
              onRemoveOption={handleRemoveOption}
            />
          )}
          
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                console.log("Cancel button clicked");
                onCancel();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? "Update Field" : "Add Field"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default FieldForm;
