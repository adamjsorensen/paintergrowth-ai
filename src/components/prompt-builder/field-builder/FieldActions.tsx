
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FieldType, FieldOption, FieldConfig, MatrixConfig, isMatrixConfig, createDefaultMatrixConfig } from "@/types/prompt-templates";
import FieldForm from "../field-form/FieldForm";

interface FieldActionsProps {
  isAddingField: boolean;
  setIsAddingField: (value: boolean) => void;
  editingFieldId: string | null;
  setEditingFieldId: (value: string | null) => void;
  options: FieldOption[];
  setOptions: React.Dispatch<React.SetStateAction<FieldOption[]>>;
  matrixConfig: MatrixConfig;
  setMatrixConfig: React.Dispatch<React.SetStateAction<MatrixConfig>>;
  onAddField: (values: any) => void;
  onUpdateField: (values: any) => void;
  onCancel: () => void;
  fields: FieldConfig[];
}

const fieldSchema = z.object({
  label: z.string().min(1, "Label is required"),
  name: z.string()
    .min(1, "Template variable name is required")
    .regex(/^[a-z][a-zA-Z0-9]*$/, "Must start with lowercase letter and contain only letters and numbers")
    .transform(val => val.replace(/\s+/g, '')),
  type: z.enum([
    "text", 
    "textarea", 
    "select", 
    "number", 
    "toggle", 
    "date", 
    "checkbox-group", 
    "multi-select", 
    "file-upload", 
    "quote-table", 
    "upsell-table", 
    "tax-calculator",
    "matrix-selector",
    "scope-of-work"
  ] as const),
  sectionId: z.string().min(1, "Section is required"),
  required: z.boolean().default(false),
  complexity: z.enum(["basic", "advanced"]).default("basic"),
  helpText: z.string().optional(),
  placeholder: z.string().optional(),
  modalStep: z.enum(["main", "style", "scope"]).default("main"),
});

const FieldActions: React.FC<FieldActionsProps> = ({
  isAddingField,
  setIsAddingField,
  editingFieldId,
  setEditingFieldId,
  options,
  setOptions,
  matrixConfig,
  setMatrixConfig,
  onAddField,
  onUpdateField,
  onCancel,
  fields,
}) => {
  const form = useForm<z.infer<typeof fieldSchema>>({
    resolver: zodResolver(fieldSchema),
    defaultValues: {
      label: "",
      name: "",
      type: "text",
      sectionId: "client",
      required: false,
      complexity: "basic",
      helpText: "",
      placeholder: "",
      modalStep: "main",
    },
  });

  useEffect(() => {
    if (editingFieldId) {
      const field = fields.find(f => f.id === editingFieldId);
      if (field) {
        form.reset({
          label: field.label,
          name: field.name || "",
          type: field.type,
          sectionId: field.sectionId || "client",
          required: field.required || false,
          complexity: field.complexity || "basic",
          helpText: field.helpText || "",
          placeholder: field.placeholder || "",
          modalStep: field.modalStep || "main",
        });
        
        if (field.type === "matrix-selector" && field.options && isMatrixConfig(field.options)) {
          // Ensure the type discriminator exists
          const config: MatrixConfig = {
            ...field.options,
            type: 'matrix-config'
          };
          setMatrixConfig(config);
        } else if (field.type === "matrix-selector") {
          // Fallback to default if matrix options aren't valid
          setMatrixConfig(createDefaultMatrixConfig());
        }
        
        if (Array.isArray(field.options)) {
          setOptions(field.options);
        } else {
          setOptions([]);
        }
      }
    } else {
      form.reset({
        label: "",
        name: "",
        type: "text",
        sectionId: "client",
        required: false,
        complexity: "basic",
        helpText: "",
        placeholder: "",
        modalStep: "main",
      });
      setOptions([]);
      setMatrixConfig(createDefaultMatrixConfig());
    }
  }, [editingFieldId, form, setOptions, setMatrixConfig, fields]);

  const handleSubmit = (values: z.infer<typeof fieldSchema>) => {
    try {
      if (editingFieldId) {
        onUpdateField({ ...values });
      } else {
        onAddField({ ...values });
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    }
  };

  return (
    <>
      {(isAddingField || editingFieldId) && (
        <FieldForm
          form={form}
          isEditing={!!editingFieldId}
          options={options}
          setOptions={setOptions}
          matrixConfig={matrixConfig}
          setMatrixConfig={setMatrixConfig}
          onSubmit={handleSubmit}
          onCancel={onCancel}
        />
      )}
    </>
  );
};

export default FieldActions;
