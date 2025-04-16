
import { FieldConfig, isFieldOptionArray } from "@/types/prompt-templates";
import { Card, CardContent } from "@/components/ui/card";
import FieldBuilderHeader from "./FieldBuilderHeader";
import FieldActions from "./FieldActions";
import FieldSections from "./components/FieldSections";
import { useFieldManagement } from "./hooks/useFieldManagement";

interface FieldBuilderProps {
  fields: FieldConfig[];
  setFields: React.Dispatch<React.SetStateAction<FieldConfig[]>>;
}

const FieldBuilder: React.FC<FieldBuilderProps> = ({ fields, setFields }) => {
  const {
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
  } = useFieldManagement(fields, setFields);

  const databaseFields = fields.filter(field => !field.id.startsWith('enhanced-'));
  const fallbackFields = fields.filter(field => field.id.startsWith('enhanced-'));

  const handleEditField = (field: FieldConfig) => {
    setEditingFieldId(field.id);
    if (field.options && isFieldOptionArray(field.options)) {
      setOptions(field.options);
    } else {
      setOptions([]);
    }
  };

  const handleDeleteField = (fieldId: string) => {
    if (!fieldId.startsWith('enhanced-')) {
      deleteField.mutate(fieldId);
    }
    
    setFields((prev) => 
      prev.filter((field) => field.id !== fieldId)
        .map((field, index) => ({ ...field, order: index + 1 }))
    );
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
        
        <FieldSections
          databaseFields={databaseFields}
          fallbackFields={fallbackFields}
          isAddingField={isAddingField}
          onEditField={handleEditField}
          onDeleteField={handleDeleteField}
          onMoveField={handleMoveField}
        />
      </CardContent>
    </Card>
  );
};

export default FieldBuilder;
