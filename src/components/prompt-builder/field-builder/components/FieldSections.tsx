
import React from "react";
import { FieldConfig } from "@/types/prompt-templates";
import EmptyState from "../EmptyState";
import FieldList from "../FieldList";
import FallbackFields from "../FallbackFields";

interface FieldSectionsProps {
  databaseFields: FieldConfig[];
  fallbackFields: FieldConfig[];
  isAddingField: boolean;
  onEditField: (field: FieldConfig) => void;
  onDeleteField: (fieldId: string) => void;
  onMoveField: (fieldId: string, direction: "up" | "down") => void;
}

const FieldSections: React.FC<FieldSectionsProps> = ({
  databaseFields,
  fallbackFields,
  isAddingField,
  onEditField,
  onDeleteField,
  onMoveField
}) => {
  return (
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
            onEditField={onEditField}
            onDeleteField={onDeleteField}
            onMoveField={onMoveField}
          />
        </div>
      )}
      
      <FallbackFields
        fields={fallbackFields}
        onEditField={onEditField}
        onDeleteField={onDeleteField}
        onMoveField={onMoveField}
      />
    </div>
  );
};

export default FieldSections;
