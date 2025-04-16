
import React from "react";
import { FieldConfig } from "@/types/prompt-templates";
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
import { HelpText } from "./components/HelpText";

// Define the structure of a matrix row
export interface MatrixRow {
  id: string;
  room: string;
  quantity: number;
  walls: boolean;
  ceiling: boolean;
  trim: boolean;
  doors: boolean;
  closets: boolean;
}

// Default rooms for the MVP implementation
const DEFAULT_ROOMS = [
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

interface MatrixSelectorFieldProps {
  field: FieldConfig;
  value: MatrixRow[];
  onChange: (value: MatrixRow[]) => void;
  isAdvanced?: boolean;
}

const MatrixSelectorField: React.FC<MatrixSelectorFieldProps> = ({
  field,
  value,
  onChange,
  isAdvanced
}) => {
  // Initialize the matrix with default values if empty
  const matrixValue = React.useMemo(() => {
    if (!value || !Array.isArray(value) || value.length === 0) {
      return DEFAULT_ROOMS.map(room => ({
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

  const handleCheckboxChange = (rowId: string, field: keyof MatrixRow) => {
    const updatedMatrix = matrixValue.map(row => 
      row.id === rowId ? { ...row, [field]: !row[field] } : row
    );
    onChange(updatedMatrix);
  };

  return (
    <div className="space-y-2">
      <div>
        <Label htmlFor={field.id} className="font-medium">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {field.helpText && <HelpText>{field.helpText}</HelpText>}
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

export default MatrixSelectorField;
