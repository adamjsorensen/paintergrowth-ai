import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FieldType, FieldOption, FieldConfig, MatrixConfig } from "@/types/prompt-templates";
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
    "matrix-selector"
  ]),
  sectionId: z.string().min(1, "Section is required"),
  required: z.boolean().default(false),
  complexity: z.enum(["basic", "advanced"]).default("basic"),
  helpText: z.string().optional(),
  placeholder: z.string().optional(),
});

const defaultMatrixConfig: MatrixConfig = {
  rows: [
    { id: "kitchen", label: "Kitchen" },
    { id: "living_room", label: "Living Room" },
    { id: "dining_room", label: "Dining Room" },
    { id: "master_bedroom", label: "Master Bedroom" }
  ],
  columns: [
    { id: "quantity", label: "Qty", type: "number" },
    { id: "walls", label: "Walls", type: "checkbox" },
    { id: "ceiling", label: "Ceiling", type: "checkbox" },
    { id: "trim", label: "Trim", type: "checkbox" },
    { id: "doors", label: "Doors", type: "checkbox" }
  ]
};

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
  fields,
}) => {
  const [matrixConfig, setMatrixConfig] = useState<MatrixConfig>(defaultMatrixConfig);
  
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
        });
        
        if (field.type === "matrix-selector" && field.options && typeof field.options !== 'string' && 'rows' in field.options && 'columns' in field.options) {
          setMatrixConfig(field.options as MatrixConfig);
        } else {
          setMatrixConfig(defaultMatrixConfig);
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
      });
      setOptions([]);
      setMatrixConfig(defaultMatrixConfig);
    }
  }, [editingFieldId, form, setOptions, fields]);

  const handleSubmit = (values: z.infer<typeof fieldSchema>) => {
    try {
      const fieldType = values.type;
      let fieldOptions: any = options;
      
      if (fieldType === "matrix-selector") {
        fieldOptions = matrixConfig;
      }
      
      if (editingFieldId) {
        onUpdateField({ ...values, options: fieldOptions });
      } else {
        onAddField({ ...values, options: fieldOptions });
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
