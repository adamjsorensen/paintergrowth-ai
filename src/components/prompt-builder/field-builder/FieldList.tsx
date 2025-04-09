
import React from "react";
import { FieldConfig } from "@/types/prompt-templates";
import FieldCard from "../FieldCard";

interface FieldListProps {
  fields: FieldConfig[];
  onEditField: (field: FieldConfig) => void;
  onDeleteField: (fieldId: string) => void;
  onMoveField: (fieldId: string, direction: "up" | "down") => void;
}

const FieldList: React.FC<FieldListProps> = ({
  fields,
  onEditField,
  onDeleteField,
  onMoveField,
}) => {
  const sortedFields = [...fields].sort((a, b) => a.order - b.order);
  
  return (
    <div className="space-y-4">
      {sortedFields.map((field) => (
        <FieldCard
          key={field.id}
          field={field}
          onEdit={() => onEditField(field)}
          onDelete={() => onDeleteField(field.id)}
          onMoveUp={() => onMoveField(field.id, "up")}
          onMoveDown={() => onMoveField(field.id, "down")}
          isFirst={field.order === 1}
          isLast={field.order === fields.length}
        />
      ))}
    </div>
  );
};

export default FieldList;
