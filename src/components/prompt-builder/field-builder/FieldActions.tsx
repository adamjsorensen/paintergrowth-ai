
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FieldType, FieldOption } from "@/types/prompt-templates";
import FieldForm from "../field-form/FieldForm";

interface FieldActionsProps {
  isAddingField: boolean;
  setIsAddingField: (value: boolean) => void;
  editingFieldId: string | null;
  setEditingFieldId: (value: string | null) => void;
  options: FieldOption[];
  setOptions: React.Dispatch<React.SetStateAction<FieldOption[]>>;
  onAddField: (values: any) => void;
  onUpdateField: (values: any) => void;
  onCancel: () => void;
}

const fieldSchema = z.object({
  label: z.string().min(1, "Label is required"),
  type: z.enum(["text", "textarea", "select", "number", "toggle", "date", "checkbox-group", "multi-select", "file-upload", "quote-table", "upsell-table", "tax-calculator"]),
  sectionId: z.string().min(1, "Section is required"),
  required: z.boolean().default(false),
  complexity: z.enum(["basic", "advanced"]).default("basic"),
  helpText: z.string().optional(),
  placeholder: z.string().optional(),
});

const FieldActions: React.FC<FieldActionsProps> = ({
  isAddingField,
  setIsAddingField,
  editingFieldId,
  setEditingFieldId,
  options,
  setOptions,
  onAddField,
  onUpdateField,
  onCancel,
}) => {
  console.log("FieldActions rendering - isAddingField:", isAddingField, "editingFieldId:", editingFieldId);
  
  const form = useForm<z.infer<typeof fieldSchema>>({
    resolver: zodResolver(fieldSchema),
    defaultValues: {
      label: "",
      type: "text",
      sectionId: "client",
      required: false,
      complexity: "basic",
      helpText: "",
      placeholder: "",
    },
  });

  const handleSubmit = (values: z.infer<typeof fieldSchema>) => {
    console.log("FieldActions handleSubmit called with values:", values);
    
    try {
      if (editingFieldId) {
        console.log("Calling onUpdateField");
        onUpdateField(values);
      } else {
        console.log("Calling onAddField");
        onAddField(values);
      }
      console.log("handleSubmit completed successfully");
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    }
  };

  console.log("FieldActions about to render FieldForm");
  
  return (
    <>
      {(isAddingField || editingFieldId) && (
        <FieldForm
          form={form}
          isEditing={!!editingFieldId}
          options={options}
          setOptions={setOptions}
          onSubmit={handleSubmit}
          onCancel={onCancel}
        />
      )}
    </>
  );
};

export default FieldActions;
