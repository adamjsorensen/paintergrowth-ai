
import { useState } from "react";
import { FieldConfig, FieldOption } from "@/types/prompt-templates";
import { Card, CardContent } from "@/components/ui/card";
import FieldBuilderHeader from "./FieldBuilderHeader";
import FieldActions from "./FieldActions";
import FieldList from "./FieldList";
import FallbackFields from "./FallbackFields";
import EmptyState from "./EmptyState";
import { usePromptFields } from "@/hooks/usePromptFields";
import { useToast } from "@/hooks/use-toast";

interface FieldBuilderProps {
  fields: FieldConfig[];
  setFields: React.Dispatch<React.SetStateAction<FieldConfig[]>>;
}

const FieldBuilder: React.FC<FieldBuilderProps> = ({ fields, setFields }) => {
  const [isAddingField, setIsAddingField] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [options, setOptions] = useState<FieldOption[]>([]);
  const { createField, updateField, deleteField } = usePromptFields();
  const { toast } = useToast();

  const databaseFields = fields.filter(field => !field.id.startsWith('enhanced-'));
  const fallbackFields = fields.filter(field => field.id.startsWith('enhanced-'));

  const handleAddField = (values: any) => {
    try {
      console.log("handleAddField called with values:", values);
      
      // Create field in prompt_fields table
      createField.mutate({
        name: values.name,
        label: values.label,
        type: values.type,
        section: values.sectionId,
        required: values.required || false,
        complexity: values.complexity || 'basic',
        help_text: values.helpText || "",
        placeholder: values.placeholder || "",
        options: values.options?.length > 0 ? values.options : undefined,
        order_position: fields.length + 1,
        active: true
      });
      
      // Also update local state for immediate UI update
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
      // Update in database
      updateField.mutate({
        id: editingFieldId,
        name: values.name,
        label: values.label,
        type: values.type,
        section: values.sectionId,
        required: values.required || false,
        complexity: values.complexity || 'basic',
        help_text: values.helpText || "",
        placeholder: values.placeholder || "",
        options: values.options?.length > 0 ? values.options : undefined,
      });
      
      // Update local state
      setFields((prev) =>
        prev.map((field) => {
          if (field.id === editingFieldId) {
            return {
              ...field,
              ...values,
              options: values.options
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

  const handleEditField = (field: FieldConfig) => {
    setEditingFieldId(field.id);
    setOptions(field.options || []);
  };

  const handleDeleteField = (fieldId: string) => {
    // Delete from database if not an enhanced field
    if (!fieldId.startsWith('enhanced-')) {
      deleteField.mutate(fieldId);
    }
    
    // Update local state
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
        [newFields[fieldIndex - 1], newFields[fieldIndex]] = 
          [newFields[fieldIndex], newFields[fieldIndex - 1]];
      } else if (direction === "down" && fieldIndex < newFields.length - 1) {
        [newFields[fieldIndex], newFields[fieldIndex + 1]] = 
          [newFields[fieldIndex + 1], newFields[fieldIndex]];
      }
      
      return newFields.map((field, index) => ({ ...field, order: index + 1 }));
    });
  };

  const handleCancel = () => {
    setIsAddingField(false);
    setEditingFieldId(null);
    setOptions([]);
  };
  
  return (
    <Card>
      <CardContent className="pt-6">
        <FieldBuilderHeader 
          isAddingField={isAddingField} 
          editingFieldId={editingFieldId} 
          onAddFieldClick={() => setIsAddingField(true)} 
        />
        
        <FieldActions
          isAddingField={isAddingField}
          setIsAddingField={setIsAddingField}
          editingFieldId={editingFieldId}
          setEditingFieldId={setEditingFieldId}
          options={options}
          setOptions={setOptions}
          onAddField={handleAddField}
          onUpdateField={handleUpdateField}
          onCancel={handleCancel}
          fields={fields}
        />
        
        <div className="space-y-4">
          {databaseFields.length === 0 && !isAddingField && <EmptyState />}
          
          {databaseFields.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-foreground">
                  Input Fields ({databaseFields.length})
                </h3>
              </div>
              <FieldList
                fields={databaseFields}
                onEditField={handleEditField}
                onDeleteField={handleDeleteField}
                onMoveField={handleMoveField}
              />
            </div>
          )}
          
          <FallbackFields
            fields={fallbackFields}
            onEditField={handleEditField}
            onDeleteField={handleDeleteField}
            onMoveField={handleMoveField}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default FieldBuilder;
