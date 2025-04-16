
import React from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { MatrixColumn } from "@/types/prompt-templates";
import { MatrixItem } from "./types";

interface MatrixCellProps {
  row: MatrixItem;
  column: MatrixColumn;
  onChange: (rowId: string, columnId: string, value: any) => void;
}

const MatrixCell: React.FC<MatrixCellProps> = ({ row, column, onChange }) => {
  if (column.type === "number") {
    return (
      <Input
        type="number"
        min="0"
        value={row[column.id] as number}
        onChange={(e) => onChange(row.id, column.id, parseInt(e.target.value) || 0)}
        className="h-8 w-16 text-center"
      />
    );
  } else if (column.type === "checkbox") {
    return (
      <Checkbox 
        checked={Boolean(row[column.id])}
        onCheckedChange={(checked) => onChange(row.id, column.id, Boolean(checked))}
        className="mx-auto"
      />
    );
  }
  return null;
};

export default MatrixCell;
