
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FieldConfig, FieldType, FieldOption } from "@/types/prompt-templates";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import FieldCard from "./FieldCard";
import FieldForm from "./field-form/FieldForm";

interface FieldBuilderProps {
  fields: FieldConfig[];
  setFields: React.Dispatch<React.SetStateAction<FieldConfig[]>>;
}

const fieldSchema = z.object({
  label: z.string().min(1, "Label is required"),
  type: z.enum(["text", "textarea", "select", "number", "toggle", "date", "checkbox-group", "multi-select", "file-upload"]),
  required: z.boolean().default(false),
  helpText: z.string().optional(),
  placeholder: z.string().optional(),
});

type FieldFormValues = z.infer<typeof fieldSchema>;

const FieldBuilder: React.FC<FieldBuilderProps> = ({ fields, setFields }) => {
  const [isAddingField, setIsAddingField] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [options, setOptions] = useState<FieldOption[]>([]);

  const form = useForm<FieldFormValues>({
    resolver: zodResolver(fieldSchema),
    defaultValues: {
      label: "",
      type: "text",
      required: false,
      helpText: "",
      placeholder: "",
    },
  });

  const handleAddField = (values: FieldFormValues) => {
    const fieldId = values.label.toLowerCase().replace(/\s+/g, "_");
    
    const newField: FieldConfig = {
      id: fieldId,
      label: values.label,
      type: values.type as FieldType,
      required: values.required,
      helpText: values.helpText,
      placeholder: values.placeholder,
      order: fields.length + 1,
      complexity: 'basic', // Set default complexity to basic for new fields
    };
    
    // Handle options for select, checkbox-group, and multi-select field types
    if (["select", "checkbox-group", "multi-select"].includes(values.type) && options.length > 0) {
      newField.options = [...options];
    }
    
    setFields((prev) => [...prev, newField]);
    setIsAddingField(false);
    setOptions([]);
    form.reset();
  };

  const handleUpdateField = (values: FieldFormValues) => {
    if (!editingFieldId) return;
    
    setFields((prev) =>
      prev.map((field) => {
        if (field.id === editingFieldId) {
          const updatedField: FieldConfig = {
            ...field,
            label: values.label,
            type: values.type as FieldType,
            required: values.required,
            helpText: values.helpText,
            placeholder: values.placeholder,
            // Preserve existing complexity or default to basic if not present
            complexity: field.complexity || 'basic',
          };
          
          // Handle options for select, checkbox-group, and multi-select field types
          if (["select", "checkbox-group", "multi-select"].includes(values.type)) {
            updatedField.options = [...options];
          } else {
            delete updatedField.options;
          }
          
          return updatedField;
        }
        return field;
      })
    );
    
    setEditingFieldId(null);
    setOptions([]);
    form.reset();
  };

  const handleEditField = (field: FieldConfig) => {
    setEditingFieldId(field.id);
    setOptions(field.options || []);
    
    form.reset({
      label: field.label,
      type: field.type,
      required: field.required,
      helpText: field.helpText || "",
      placeholder: field.placeholder || "",
    });
  };

  const handleDeleteField = (fieldId: string) => {
    setFields((prev) => 
      prev.filter((field) => field.id !== fieldId)
        .map((field, index) => ({ ...field, order: index + 1 }))
    );
  };

  const handleMoveField = (fieldId: string, direction: "up" | "down") => {
    setFields((prev) => {
      const fieldIndex = prev.findIndex((field) => field.id === fieldId);
      if (fieldIndex === -1) return prev;
      
      const newFields = [...prev];
      
      if (direction === "up" && fieldIndex > 0) {
        // Swap with previous field
        [newFields[fieldIndex - 1], newFields[fieldIndex]] = 
          [newFields[fieldIndex], newFields[fieldIndex - 1]];
      } else if (direction === "down" && fieldIndex < newFields.length - 1) {
        // Swap with next field
        [newFields[fieldIndex], newFields[fieldIndex + 1]] = 
          [newFields[fieldIndex + 1], newFields[fieldIndex]];
      }
      
      // Update order
      return newFields.map((field, index) => ({ ...field, order: index + 1 }));
    });
  };

  const handleCancel = () => {
    setIsAddingField(false);
    setEditingFieldId(null);
    setOptions([]);
    form.reset();
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Input Fields</h3>
          {!isAddingField && !editingFieldId && (
            <Button onClick={() => setIsAddingField(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Field
            </Button>
          )}
        </div>
        
        {(isAddingField || editingFieldId) && (
          <FieldForm
            form={form}
            isEditing={!!editingFieldId}
            options={options}
            setOptions={setOptions}
            onSubmit={editingFieldId ? handleUpdateField : handleAddField}
            onCancel={handleCancel}
          />
        )}
        
        <div className="space-y-4">
          {fields.length === 0 && !isAddingField && (
            <div className="text-center py-8 text-gray-500">
              <p>No fields added yet.</p>
              <p className="text-sm">Click "Add Field" to create your first input field.</p>
            </div>
          )}
          
          {fields
            .sort((a, b) => a.order - b.order)
            .map((field) => (
              <FieldCard
                key={field.id}
                field={field}
                onEdit={() => handleEditField(field)}
                onDelete={() => handleDeleteField(field.id)}
                onMoveUp={() => handleMoveField(field.id, "up")}
                onMoveDown={() => handleMoveField(field.id, "down")}
                isFirst={field.order === 1}
                isLast={field.order === fields.length}
              />
            ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FieldBuilder;
