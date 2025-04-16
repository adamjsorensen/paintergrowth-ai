
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from "@/components/ui/table";
import { FieldOption, MatrixConfig } from "@/types/prompt-templates";

interface MatrixFieldProps {
  id: string;
  label: string;
  required?: boolean;
  helpText?: string;
  value: any[];
  onChange: (value: any[]) => void;
  options?: FieldOption[] | MatrixConfig;
}

// Interface for matrix items in the form
interface MatrixItem {
  id: string;
  [key: string]: string | number | boolean;
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
  const getMatrixConfig = (): MatrixConfig => {
    // Default configuration if none is provided
    const defaultConfig: MatrixConfig = {
      rows: [
        { id: "kitchen", label: "Kitchen" },
        { id: "living_room", label: "Living Room" },
        { id: "dining_room", label: "Dining Room" },
        { id: "master_bedroom", label: "Master Bedroom" },
        { id: "bathroom", label: "Bathroom" },
        { id: "guest_bedroom", label: "Guest Bedroom" },
        { id: "hallway", label: "Hallway" },
        { id: "garage", label: "Garage" },
        { id: "bonus_room", label: "Bonus Room" }
      ],
      columns: [
        { id: "quantity", label: "Qty", type: "number" },
        { id: "walls", label: "Walls", type: "checkbox" },
        { id: "ceiling", label: "Ceiling", type: "checkbox" },
        { id: "trim", label: "Trim", type: "checkbox" },
        { id: "doors", label: "Doors", type: "checkbox" },
        { id: "closets", label: "Closets", type: "checkbox" }
      ]
    };
    
    // Check if options exist and are in the right format
    if (options && typeof options === "object" && !Array.isArray(options) &&
        'rows' in options && 'columns' in options) {
      return options as MatrixConfig;
    }
    
    return defaultConfig;
  };
  
  const matrixConfig = getMatrixConfig();
  
  // Initialize the matrix with default values if empty
  const matrixValue = React.useMemo(() => {
    if (!value || !Array.isArray(value) || value.length === 0) {
      // Create initial value based on the configuration
      return matrixConfig.rows.map(row => {
        const item: MatrixItem = {
          id: row.id,
          label: row.label, // Store the label for display
        };
        
        // Initialize all columns with default values
        matrixConfig.columns.forEach(col => {
          if (col.type === "number") {
            item[col.id] = 1; // Default number value
          } else if (col.type === "checkbox") {
            item[col.id] = false; // Default checkbox value
          }
        });
        
        return item;
      });
    }
    return value;
  }, [value, matrixConfig]);

  // Handle value changes for each cell
  const handleValueChange = (rowId: string, columnId: string, newValue: any) => {
    const updatedMatrix = matrixValue.map(row => 
      row.id === rowId ? { ...row, [columnId]: newValue } : row
    );
    onChange(updatedMatrix);
  };

  // Render a cell based on the column type
  const renderCell = (row: MatrixItem, column: { id: string; type: string; label: string }) => {
    if (column.type === "number") {
      return (
        <Input
          type="number"
          min="0"
          value={row[column.id] as number}
          onChange={(e) => handleValueChange(row.id, column.id, parseInt(e.target.value) || 0)}
          className="h-8 w-16 text-center"
        />
      );
    } else if (column.type === "checkbox") {
      return (
        <Checkbox 
          checked={Boolean(row[column.id])}
          onCheckedChange={(checked) => handleValueChange(row.id, column.id, Boolean(checked))}
          className="mx-auto"
        />
      );
    }
    return null;
  };

  return (
    <div className="space-y-2">
      <div>
        <Label htmlFor={id} className="font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {helpText && <p className="text-xs text-gray-500 mt-1">{helpText}</p>}
      </div>
      
      <div className="overflow-x-auto border rounded-md">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-1/4">Room</TableHead>
              {matrixConfig.columns.map(column => (
                <TableHead key={column.id} className="text-center">
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {matrixValue.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.label || row.id}</TableCell>
                {matrixConfig.columns.map(column => (
                  <TableCell key={`${row.id}-${column.id}`} className="text-center">
                    {renderCell(row, column)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {matrixConfig.columns.some(col => col.id === "quantity" || col.type === "number") && (
        <p className="text-xs text-muted-foreground mt-1">
          Set quantity to 0 for rooms not included in the project.
        </p>
      )}
    </div>
  );
};

export default MatrixField;
