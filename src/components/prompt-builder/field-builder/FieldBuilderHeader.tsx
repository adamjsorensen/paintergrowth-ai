
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface FieldBuilderHeaderProps {
  isAddingField: boolean;
  editingFieldId: string | null;
  onAddFieldClick: () => void;
}

const FieldBuilderHeader: React.FC<FieldBuilderHeaderProps> = ({
  isAddingField,
  editingFieldId,
  onAddFieldClick,
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-lg font-semibold">Input Fields</h3>
      {!isAddingField && !editingFieldId && (
        <Button onClick={onAddFieldClick}>
          <Plus className="h-4 w-4 mr-2" />
          Add Field
        </Button>
      )}
    </div>
  );
};

export default FieldBuilderHeader;
