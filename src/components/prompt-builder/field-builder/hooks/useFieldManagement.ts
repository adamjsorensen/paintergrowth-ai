
import { useState } from "react";
import { FieldConfig, FieldOption } from "@/types/prompt-templates";
import { usePromptFields } from "@/hooks/prompt-fields/usePromptFields";
import { useToast } from "@/hooks/use-toast";
import { formatFieldOptions } from "@/hooks/prompt-fields/types";

export const useFieldManagement = (
  fields: FieldConfig[],
  setFields: React.Dispatch<React.SetStateAction<FieldConfig[]>>
) => {
  const [isAddingField, setIsAddingField] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [options, setOptions] = useState<FieldOption[]>([]);
  const { createField, updateField, deleteField } = usePromptFields();
  const { toast } = useToast();

  const handleAddField = (values: any) => {
    try {
      const newFieldData: any = {
        name: values.name,
        label: values.label,
        type: values.type,
        section: values.sectionId,
        required: values.required || false,
        complexity: values.complexity || 'basic',
        help_text: values.helpText || "",
        placeholder: values.placeholder || "",
        options: options?.length > 0 ? formatFieldOptions(options) : undefined,
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
      };
      
      if (["select", "checkbox-group", "multi-select"].includes(values.type) && options.length > 0) {
        newField.options = [...options];
      }
      
      setFields((prev) => [...prev, newField]);
      setIsAddingField(false);
      setOptions([]);
      
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
        options: options?.length > 0 ? formatFieldOptions(options) : undefined,
      };
      
      updateField.mutate(fieldUpdateData);
      
      setFields((prev) =>
        prev.map((field) => {
          if (field.id === editingFieldId) {
            return {
              ...field,
              ...values,
              options: options
            };
          }
          return field;
        })
      );
      
      setEditingFieldId(null);
      setOptions([]);
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
    handleAddField,
    handleUpdateField,
    handleMoveField,
    deleteField
  };
};
