
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, GripVertical, ArrowUp, ArrowDown } from "lucide-react";
import { MatrixConfig, MatrixColumn } from "@/types/prompt-templates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MatrixConfigEditorProps {
  config: MatrixConfig;
  onChange: (config: MatrixConfig) => void;
}

const MatrixConfigEditor: React.FC<MatrixConfigEditorProps> = ({ config, onChange }) => {
  const [newRowLabel, setNewRowLabel] = useState("");
  const [newColumnLabel, setNewColumnLabel] = useState("");
  const [newColumnType, setNewColumnType] = useState<"number" | "checkbox">("checkbox");

  // Generate a semantic ID based on the row label
  const generateSemanticRowId = (label: string): string => {
    // Convert to lowercase, replace spaces with underscores, remove special chars
    const baseId = label.toLowerCase().trim().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    
    // Check if this ID already exists
    const existingIds = config.rows.map(row => row.id);
    if (!existingIds.includes(baseId)) {
      return baseId;
    }
    
    // If ID exists, add a numeric suffix
    let counter = 1;
    while (existingIds.includes(`${baseId}_${counter}`)) {
      counter++;
    }
    return `${baseId}_${counter}`;
  };

  // Add a new row
  const handleAddRow = () => {
    if (!newRowLabel.trim()) return;
    
    // Use semantic ID based on the label instead of timestamp
    const semanticId = generateSemanticRowId(newRowLabel);
    
    const newRow = {
      id: semanticId,
      label: newRowLabel.trim(),
    };
    onChange({
      ...config,
      rows: [...config.rows, newRow],
    });
    setNewRowLabel("");
  };

  // Generate a semantic ID based on the column label
  const generateSemanticColumnId = (label: string): string => {
    // Convert to lowercase, replace spaces with underscores, remove special chars
    const baseId = label.toLowerCase().trim().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    
    // Check if this ID already exists
    const existingIds = config.columns.map(col => col.id);
    if (!existingIds.includes(baseId)) {
      return baseId;
    }
    
    // If ID exists, add a numeric suffix
    let counter = 1;
    while (existingIds.includes(`${baseId}_${counter}`)) {
      counter++;
    }
    return `${baseId}_${counter}`;
  };

  // Add a new column
  const handleAddColumn = () => {
    if (!newColumnLabel.trim()) return;
    
    // Use semantic ID based on the label instead of timestamp
    const semanticId = generateSemanticColumnId(newColumnLabel);
    
    const newColumn = {
      id: semanticId,
      label: newColumnLabel.trim(),
      type: newColumnType,
    };
    onChange({
      ...config,
      columns: [...config.columns, newColumn],
    });
    setNewColumnLabel("");
  };

  // Remove a row
  const handleRemoveRow = (id: string) => {
    onChange({
      ...config,
      rows: config.rows.filter((row) => row.id !== id),
    });
  };

  // Remove a column
  const handleRemoveColumn = (id: string) => {
    onChange({
      ...config,
      columns: config.columns.filter((col) => col.id !== id),
    });
  };

  // Move a row up or down
  const moveRow = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === config.rows.length - 1)
    ) {
      return;
    }

    const newIndex = direction === "up" ? index - 1 : index + 1;
    const newRows = [...config.rows];
    [newRows[index], newRows[newIndex]] = [newRows[newIndex], newRows[index]];
    
    onChange({
      ...config,
      rows: newRows,
    });
  };

  // Move a column up or down
  const moveColumn = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === config.columns.length - 1)
    ) {
      return;
    }

    const newIndex = direction === "up" ? index - 1 : index + 1;
    const newColumns = [...config.columns];
    [newColumns[index], newColumns[newIndex]] = [newColumns[newIndex], newColumns[index]];
    
    onChange({
      ...config,
      columns: newColumns,
    });
  };

  // Update a row label
  const updateRowLabel = (id: string, newLabel: string) => {
    onChange({
      ...config,
      rows: config.rows.map((row) =>
        row.id === id ? { ...row, label: newLabel } : row
      ),
    });
  };

  // Update a column label or type
  const updateColumn = (id: string, field: "label" | "type", value: string) => {
    onChange({
      ...config,
      columns: config.columns.map((col) =>
        col.id === id ? { ...col, [field]: field === "type" ? value as "number" | "checkbox" : value } : col
      ),
    });
  };

  return (
    <div className="space-y-6">
      {/* Rows Configuration */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Rows Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Row list */}
            <div className="space-y-2">
              {config.rows.map((row, index) => (
                <div
                  key={row.id}
                  className="flex items-center gap-2 p-2 border rounded-md bg-background"
                >
                  <div className="text-muted-foreground">
                    <GripVertical className="h-4 w-4" />
                  </div>
                  <Input
                    value={row.label}
                    onChange={(e) => updateRowLabel(row.id, e.target.value)}
                    className="flex-1"
                    placeholder="Row label"
                  />
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => moveRow(index, "up")}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => moveRow(index, "down")}
                      disabled={index === config.rows.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveRow(row.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add new row */}
            <div className="flex items-center gap-2">
              <Input
                value={newRowLabel}
                onChange={(e) => setNewRowLabel(e.target.value)}
                className="flex-1"
                placeholder="Add a new row (e.g. Kitchen)"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddRow}
                disabled={!newRowLabel.trim()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Row
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Columns Configuration */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Columns Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Column list */}
            <div className="space-y-2">
              {config.columns.map((column, index) => (
                <div
                  key={column.id}
                  className="flex items-center gap-2 p-2 border rounded-md bg-background"
                >
                  <div className="text-muted-foreground">
                    <GripVertical className="h-4 w-4" />
                  </div>
                  <Input
                    value={column.label}
                    onChange={(e) => updateColumn(column.id, "label", e.target.value)}
                    className="flex-1"
                    placeholder="Column label"
                  />
                  <Select
                    value={column.type}
                    onValueChange={(value) => updateColumn(column.id, "type", value)}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="checkbox">Checkbox</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => moveColumn(index, "up")}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => moveColumn(index, "down")}
                      disabled={index === config.columns.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveColumn(column.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add new column */}
            <div className="flex flex-col space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  value={newColumnLabel}
                  onChange={(e) => setNewColumnLabel(e.target.value)}
                  className="flex-1"
                  placeholder="Add a new column (e.g. Walls)"
                />
                <Select
                  value={newColumnType}
                  onValueChange={(value: "number" | "checkbox") => setNewColumnType(value)}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="checkbox">Checkbox</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddColumn}
                  disabled={!newColumnLabel.trim()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Column
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MatrixConfigEditor;
