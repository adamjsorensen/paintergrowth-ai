
import { useState } from "react";
import { FieldConfig, FieldOption, MatrixConfig, isMatrixConfig, validateMatrixConfig, createDefaultMatrixConfig } from "@/types/prompt-templates";
import { usePromptFields } from "@/hooks/prompt-fields/usePromptFields";
import { useToast } from "@/hooks/use-toast";

export const useFieldManagement = (
  fields: FieldConfig[],
  setFields: React.Dispatch<React.SetStateAction<FieldConfig[]>>
) => {
  const [isAddingField, setIsAddingField] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [options, setOptions] = useState<FieldOption[]>([]);
  const [matrixConfig, setMatrixConfig] = useState<MatrixConfig>(createDefaultMatrixConfig());
  const { createField, updateField, deleteField } = usePromptFields();
  const { toast } = useToast();

  const handleAddField = (values: any) => {
    try {
      let fieldOptions: any;
      
      // Handle different types of field options based on field type
      if (values.type === "matrix-selector") {
        // Update matrix config with discriminator if needed
        fieldOptions = { ...matrixConfig, type: 'matrix-config' };
        
        // Validate matrix configuration
        if (!validateMatrixConfig(fieldOptions)) {
          toast({
            title: "Invalid matrix configuration",
            description: "Matrix fields must have at least one row and one column",
            variant: "destructive",
          });
          return;
        }
      } else if (["select", "checkbox-group", "multi-select"].includes(values.type)) {
        fieldOptions = [...options];
        if (fieldOptions.length === 0) {
          toast({
            title: "Missing options",
            description: "This field type requires at least one option",
            variant: "destructive",
          });
          return;
        }
      }
      
      const newFieldData: any = {
        name: values.name,
        label: values.label,
        type: values.type,
        section: values.sectionId,
        required: values.required || false,
        complexity: values.complexity || 'basic',
        help_text: values.helpText || "",
        placeholder: values.placeholder || "",
        options: fieldOptions,
        order_position: fields.length + 1,
        active: true
      };
      
      createField.mutate(newFieldData);
      
      const fieldId = values.name.toLowerCase().replace(/\s+/g, "_");
      const newField: FieldConfig = {
        id: fieldId,
        name: values.name,
        label: values.label,
        type: values.type,
        required: values.required,
        helpText: values.helpText || "",
        placeholder: values.placeholder || "",
        order: fields.length + 1,
        sectionId: values.sectionId,
        complexity: values.complexity || 'basic',
        options: fieldOptions
      };
      
      setFields((prev) => [...prev, newField]);
      setIsAddingField(false);
      setOptions([]);
      setMatrixConfig(createDefaultMatrixConfig());
      
    } catch (error) {
      console.error("Error adding field:", error);
      toast({
        title: "Error",
        description: "Failed to add field",
        variant: "destructive",
      });
    }
  };

  const handleUpdateField = (values: any) => {
    if (!editingFieldId) return;
    
    try {
      let fieldOptions: any;
      
      // Handle different types of field options based on field type
      if (values.type === "matrix-selector") {
        // Update matrix config with discriminator if needed
        fieldOptions = { ...matrixConfig, type: 'matrix-config' };
        
        // Validate matrix configuration
        if (!validateMatrixConfig(fieldOptions)) {
          toast({
            title: "Invalid matrix configuration",
            description: "Matrix fields must have at least one row and one column",
            variant: "destructive",
          });
          return;
        }
      } else if (["select", "checkbox-group", "multi-select"].includes(values.type)) {
        fieldOptions = [...options];
        if (fieldOptions.length === 0) {
          toast({
            title: "Missing options",
            description: "This field type requires at least one option",
            variant: "destructive",
          });
          return;
        }
      }
      
      const fieldUpdateData: any = {
        id: editingFieldId,
        name: values.name,
        label: values.label,
        type: values.type,
        section: values.sectionId,
        required: values.required || false,
        complexity: values.complexity || 'basic',
        help_text: values.helpText || "",
        placeholder: values.placeholder || "",
        options: fieldOptions,
      };
      
      updateField.mutate(fieldUpdateData);
      
      setFields((prev) =>
        prev.map((field) => {
          if (field.id === editingFieldId) {
            return {
              ...field,
              ...values,
              options: fieldOptions
            };
          }
          return field;
        })
      );
      
      setEditingFieldId(null);
      setOptions([]);
      setMatrixConfig(createDefaultMatrixConfig());
    } catch (error) {
      console.error("Error updating field:", error);
      toast({
        title: "Error",
        description: "Failed to update field",
        variant: "destructive",
      });
    }
  };

  const handleMoveField = (fieldId: string, direction: "up" | "down") => {
    setFields((prev) => {
      const fieldIndex = prev.findIndex((field) => field.id === fieldId);
      if (fieldIndex === -1) return prev;
      
      const newFields = [...prev];
      
      if (direction === "up" && fieldIndex > 0) {
        [newFields[fieldIndex - 1], newFields[fieldIndex]] = 
          [newFields[fieldIndex], newFields[fieldIndex - 1]];
      } else if (direction === "down" && fieldIndex < newFields.length - 1) {
        [newFields[fieldIndex], newFields[fieldIndex + 1]] = 
          [newFields[fieldIndex + 1], newFields[fieldIndex]];
      }
      
      return newFields.map((field, index) => ({ ...field, order: index + 1 }));
    });
  };

  return {
    isAddingField,
    setIsAddingField,
    editingFieldId,
    setEditingFieldId,
    options,
    setOptions,
    matrixConfig,
    setMatrixConfig,
    handleAddField,
    handleUpdateField,
    handleMoveField,
    deleteField
  };
};
