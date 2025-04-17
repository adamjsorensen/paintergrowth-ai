
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { v4 as uuid } from "uuid";
import { FieldConfig, FieldOption, isFieldOptionArray, isMatrixConfig, createDefaultMatrixConfig, MatrixConfig } from "@/types/prompt-templates";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { usePromptFields } from "@/hooks/prompt-fields/usePromptFields";
import { Json } from "@/integrations/supabase/types";

export const useFieldManagement = (
  fields: FieldConfig[],
  setFields: React.Dispatch<React.SetStateAction<FieldConfig[]>>
) => {
  const [isAddingField, setIsAddingField] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [options, setOptions] = useState<FieldOption[]>([]);
  const [matrixConfig, setMatrixConfig] = useState<MatrixConfig>(createDefaultMatrixConfig());
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { createField, updateField, deleteField: deleteFieldMutation } = usePromptFields();

  const handleAddField = (values: any) => {
    try {
      // Create a new field object
      const newField: FieldConfig = {
        id: uuid(),
        name: values.name,
        label: values.label,
        type: values.type,
        sectionId: values.sectionId,
        required: values.required || false,
        complexity: values.complexity || "basic",
        helpText: values.helpText || "",
        placeholder: values.placeholder || "",
        order: fields.length + 1,
        modalStep: values.modalStep || "main",
        options: (values.type === "select" || values.type === "checkbox-group" || values.type === "multi-select")
          ? options
          : values.type === "matrix-selector"
          ? matrixConfig
          : undefined
      };

      // Add to state
      setFields((prev) => [...prev, newField]);

      // Prepare options for database save
      const dbOptions: Json = (values.type === "select" || values.type === "checkbox-group" || values.type === "multi-select")
        ? { options } as unknown as Json
        : values.type === "matrix-selector"
        ? matrixConfig as unknown as Json
        : undefined;

      // Save to database
      createField.mutate({
        name: values.name,
        label: values.label,
        type: values.type,
        section: values.sectionId,
        required: values.required || false,
        complexity: values.complexity || "basic",
        help_text: values.helpText || "",
        placeholder: values.placeholder || "",
        order_position: fields.length + 1,
        modal_step: values.modalStep || "main",
        options: dbOptions,
        active: true
      });

      // Reset form
      setIsAddingField(false);
      setOptions([]);
      setMatrixConfig(createDefaultMatrixConfig());

      toast({
        title: "Success",
        description: "Field added successfully",
      });
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
      const currentField = fields.find((field) => field.id === editingFieldId);
      if (!currentField) return;

      // Create updated field object
      const updatedField: FieldConfig = {
        ...currentField,
        name: values.name,
        label: values.label,
        type: values.type,
        sectionId: values.sectionId,
        required: values.required || false,
        complexity: values.complexity || "basic",
        helpText: values.helpText || "",
        placeholder: values.placeholder || "",
        modalStep: values.modalStep || "main",
        options: (values.type === "select" || values.type === "checkbox-group" || values.type === "multi-select")
          ? options
          : values.type === "matrix-selector"
          ? matrixConfig
          : undefined
      };

      // Update state
      setFields((prev) =>
        prev.map((field) => (field.id === editingFieldId ? updatedField : field))
      );

      // Prepare options for database save
      const dbOptions: Json = (values.type === "select" || values.type === "checkbox-group" || values.type === "multi-select")
        ? { options } as unknown as Json
        : values.type === "matrix-selector"
        ? matrixConfig as unknown as Json
        : undefined;

      // Update in database
      updateField.mutate({
        id: editingFieldId,
        name: values.name,
        label: values.label,
        type: values.type,
        section: values.sectionId,
        required: values.required || false,
        complexity: values.complexity || "basic",
        help_text: values.helpText || "",
        placeholder: values.placeholder || "",
        modal_step: values.modalStep || "main",
        options: dbOptions
      });

      // Reset form
      setEditingFieldId(null);
      setOptions([]);
      setMatrixConfig(createDefaultMatrixConfig());

      toast({
        title: "Success",
        description: "Field updated successfully",
      });
    } catch (error) {
      console.error("Error updating field:", error);
      toast({
        title: "Error",
        description: "Failed to update field",
        variant: "destructive",
      });
    }
  };

  // Changed to match the expected function signature in FieldBuilder.tsx
  const handleMoveField = (fieldId: string, direction: "up" | "down") => {
    setFields((prevFields) => {
      const fieldIndex = prevFields.findIndex(field => field.id === fieldId);
      if (fieldIndex === -1) return prevFields;
      
      const newFields = [...prevFields];
      let newIndex: number;
      
      if (direction === "up" && fieldIndex > 0) {
        newIndex = fieldIndex - 1;
      } else if (direction === "down" && fieldIndex < newFields.length - 1) {
        newIndex = fieldIndex + 1;
      } else {
        return prevFields; // Can't move further up or down
      }
      
      // Swap the fields
      const field = newFields[fieldIndex];
      newFields[fieldIndex] = newFields[newIndex];
      newFields[newIndex] = field;
      
      // Update order property for all fields
      return newFields.map((field, index) => ({
        ...field,
        order: index + 1
      }));
    });
  };

  // Fix the deleteField mutation to return a Promise
  const deleteField = useMutation({
    mutationFn: async (id: string) => {
      return deleteFieldMutation.mutate(id) as unknown as Promise<unknown>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promptFields"] });
    }
  });

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
