
import React, { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { FieldOption, MatrixConfig } from "@/types/prompt-templates";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FormSectionFields from "./components/FormSectionFields";
import FieldTypeSection from "./components/FieldTypeSection";
import FieldToggles from "./components/FieldToggles";
import SectionSelect from "./components/SectionSelect";
import OptionInputs from "./OptionInputs";
import MatrixConfigEditor from "./MatrixConfigEditor";

interface FieldFormProps {
  form: UseFormReturn<any>;
  isEditing: boolean;
  options: FieldOption[];
  setOptions: React.Dispatch<React.SetStateAction<FieldOption[]>>;
  matrixConfig?: MatrixConfig;
  setMatrixConfig?: React.Dispatch<React.SetStateAction<MatrixConfig>>;
  onSubmit: (values: any) => void;
  onCancel: () => void;
}

const FieldForm: React.FC<FieldFormProps> = ({
  form,
  isEditing,
  options,
  setOptions,
  matrixConfig,
  setMatrixConfig,
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

  const fieldType = form.watch("type");

  const needsOptions = () => {
    return ["select", "checkbox-group", "multi-select"].includes(fieldType);
  };

  const isMatrixSelector = () => {
    return fieldType === "matrix-selector";
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

  const handleMatrixConfigChange = (newConfig: MatrixConfig) => {
    if (setMatrixConfig) {
      setMatrixConfig(newConfig);
    }
  };

  return (
    <Card className="my-4">
      <CardContent className="pt-6">
        {/* Changed from <form> to <div> to avoid nested forms */}
        <div className="space-y-4">
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

          {isMatrixSelector() && matrixConfig && setMatrixConfig && (
            <MatrixConfigEditor 
              config={matrixConfig} 
              onChange={handleMatrixConfigChange}
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
            <Button 
              type="button" 
              onClick={() => {
                console.log("Submit button clicked");
                form.handleSubmit(handleFormSubmit)();
              }}
            >
              {isEditing ? "Update Field" : "Add Field"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FieldForm;
