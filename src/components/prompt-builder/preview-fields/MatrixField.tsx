
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
import { FieldOption } from "@/types/prompt-templates";

interface MatrixFieldProps {
  id: string;
  label: string;
  required?: boolean;
  helpText?: string;
  value: any[];
  onChange: (value: any[]) => void;
  options?: FieldOption[];
}

const DEFAULT_ROWS = [
  { id: "kitchen", room: "Kitchen" },
  { id: "living_room", room: "Living Room" },
  { id: "dining_room", room: "Dining Room" },
  { id: "master_bedroom", room: "Master Bedroom" },
  { id: "bathroom", room: "Bathroom" },
  { id: "guest_bedroom", room: "Guest Bedroom" },
  { id: "hallway", room: "Hallway" },
  { id: "garage", room: "Garage" },
  { id: "bonus_room", room: "Bonus Room" }
];

const MatrixField: React.FC<MatrixFieldProps> = ({
  id,
  label,
  required,
  helpText,
  value,
  onChange,
  options
}) => {
  // Initialize the matrix with default values if empty
  const matrixValue = React.useMemo(() => {
    if (!value || !Array.isArray(value) || value.length === 0) {
      return DEFAULT_ROWS.map(room => ({
        ...room,
        quantity: 1,
        walls: false,
        ceiling: false,
        trim: false,
        doors: false,
        closets: false
      }));
    }
    return value;
  }, [value]);

  const handleQuantityChange = (rowId: string, newQuantity: number) => {
    const updatedMatrix = matrixValue.map(row => 
      row.id === rowId ? { ...row, quantity: newQuantity } : row
    );
    onChange(updatedMatrix);
  };

  const handleCheckboxChange = (rowId: string, field: string) => {
    const updatedMatrix = matrixValue.map(row => 
      row.id === rowId ? { ...row, [field]: !row[field] } : row
    );
    onChange(updatedMatrix);
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
              <TableHead className="w-16 text-center">Qty</TableHead>
              <TableHead className="text-center">Walls</TableHead>
              <TableHead className="text-center">Ceiling</TableHead>
              <TableHead className="text-center">Trim</TableHead>
              <TableHead className="text-center">Doors</TableHead>
              <TableHead className="text-center">Closets</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matrixValue.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.room}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    value={row.quantity}
                    onChange={(e) => handleQuantityChange(row.id, parseInt(e.target.value) || 0)}
                    className="h-8 w-16 text-center"
                  />
                </TableCell>
                <TableCell className="text-center">
                  <Checkbox 
                    checked={row.walls} 
                    onCheckedChange={() => handleCheckboxChange(row.id, "walls")}
                    className="mx-auto"
                  />
                </TableCell>
                <TableCell className="text-center">
                  <Checkbox 
                    checked={row.ceiling} 
                    onCheckedChange={() => handleCheckboxChange(row.id, "ceiling")}
                    className="mx-auto"
                  />
                </TableCell>
                <TableCell className="text-center">
                  <Checkbox 
                    checked={row.trim} 
                    onCheckedChange={() => handleCheckboxChange(row.id, "trim")}
                    className="mx-auto"
                  />
                </TableCell>
                <TableCell className="text-center">
                  <Checkbox 
                    checked={row.doors} 
                    onCheckedChange={() => handleCheckboxChange(row.id, "doors")}
                    className="mx-auto"
                  />
                </TableCell>
                <TableCell className="text-center">
                  <Checkbox 
                    checked={row.closets} 
                    onCheckedChange={() => handleCheckboxChange(row.id, "closets")}
                    className="mx-auto"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {matrixValue.length > 0 && (
        <p className="text-xs text-muted-foreground mt-1">
          Set quantity to 0 for rooms not included in the project.
        </p>
      )}
    </div>
  );
};

export default MatrixField;
