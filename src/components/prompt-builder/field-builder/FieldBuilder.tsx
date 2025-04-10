
import { useState } from "react";
import { FieldConfig, FieldOption } from "@/types/prompt-templates";
import { Card, CardContent } from "@/components/ui/card";
import FieldBuilderHeader from "./FieldBuilderHeader";
import FieldActions from "./FieldActions";
import FieldList from "./FieldList";
import EmptyState from "./EmptyState";

interface FieldBuilderProps {
  fields: FieldConfig[];
  setFields: React.Dispatch<React.SetStateAction<FieldConfig[]>>;
}

const FieldBuilder: React.FC<FieldBuilderProps> = ({ fields, setFields }) => {
  const [isAddingField, setIsAddingField] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [options, setOptions] = useState<FieldOption[]>([]);

  const handleAddField = (values: any) => {
    const fieldId = values.label.toLowerCase().replace(/\s+/g, "_");
    
    const newField: FieldConfig = {
      id: fieldId,
      label: values.label,
      type: values.type,
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
  };

  const handleUpdateField = (values: any) => {
    if (!editingFieldId) return;
    
    setFields((prev) =>
      prev.map((field) => {
        if (field.id === editingFieldId) {
          const updatedField: FieldConfig = {
            ...field,
            label: values.label,
            type: values.type,
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
  };

  const handleEditField = (field: FieldConfig) => {
    setEditingFieldId(field.id);
    setOptions(field.options || []);
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
        />
        
        <div className="space-y-4">
          {fields.length === 0 && !isAddingField && <EmptyState />}
          
          <FieldList
            fields={fields}
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
