import React from "react";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead
} from "@/components/ui/table";
import { FieldOption, MatrixConfig } from "@/types/prompt-templates";
import { MatrixItem } from "./matrix/types";
import { 
  getMatrixConfig, 
  organizeRows, 
  initializeMatrixValue, 
  getRowMapping 
} from "./matrix/MatrixUtils";
import MatrixGroupedRows from "./matrix/MatrixGroupedRows";
import MatrixMobileView from "./matrix/MatrixMobileView";

interface MatrixFieldProps {
  id: string;
  label: string;
  required?: boolean;
  helpText?: string;
  value: any[];
  onChange: (value: any[]) => void;
  options?: FieldOption[] | MatrixConfig;
}

const MatrixField: React.FC<MatrixFieldProps> = ({
  id,
  label,
  required,
  helpText,
  value,
  onChange,
  options
}) => {
  // Get matrix configuration from options
  const matrixConfig = getMatrixConfig(options);
  
  // Initialize matrix value
  const matrixValue = React.useMemo(() => 
    initializeMatrixValue(value, matrixConfig), 
    [value, matrixConfig]
  );

  // Handle value changes for each cell
  const handleValueChange = (rowId: string, columnId: string, newValue: any) => {
    const updatedMatrix = matrixValue.map(row => 
      row.id === rowId ? { ...row, [columnId]: newValue } : row
    );
    onChange(updatedMatrix);
  };

  // Organize rows by groups
  const groupedRows = organizeRows(matrixConfig);
  
  // Get row mapping
  const rowMapping = getRowMapping(matrixValue);

  return (
    <div className="space-y-2">
      <div>
        <Label htmlFor={id} className="font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {helpText && <p className="text-xs text-gray-500 mt-1">{helpText}</p>}
      </div>
      
      <div className="overflow-auto border rounded-md max-h-[70vh]">
        <Table className="relative">
          <TableHeader className="sticky top-0 z-20 bg-background">
            <TableRow className="bg-muted/50">
              <TableHead className="w-1/4 px-2">Room</TableHead>
              {matrixConfig.columns.map(column => (
                <TableHead key={column.id} className="text-center px-1">
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          
          <MatrixGroupedRows
            matrixConfig={matrixConfig}
            matrixValue={matrixValue}
            rowMapping={rowMapping}
            onChange={handleValueChange}
            groupedRows={groupedRows}
          />
        </Table>
      </div>
      
      <MatrixMobileView
        matrixConfig={matrixConfig}
        matrixValue={matrixValue}
        rowMapping={rowMapping}
        onChange={handleValueChange}
        groupedRows={groupedRows}
      />
      
      {matrixConfig.columns.some(col => col.id === "quantity" || col.type === "number") && (
        <p className="text-xs text-muted-foreground mt-1">
          Set quantity to 0 for rooms not included in the project.
        </p>
      )}
    </div>
  );
};

export default MatrixField;