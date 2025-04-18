
import React, { useState, useEffect } from "react";
import { FieldConfig, MatrixConfig } from "@/types/prompt-templates";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from "@/components/ui/table";
import { HelpText } from "./components/HelpText";

// Define the structure of a matrix row for the form data
export interface MatrixItem {
  id: string;
  selected?: boolean; // Added to track row selection
  [key: string]: string | number | boolean | undefined;
}

interface MatrixSelectorFieldProps {
  field: FieldConfig;
  value: MatrixItem[];
  onChange: (value: MatrixItem[]) => void;
  isAdvanced?: boolean;
  matrixConfig?: MatrixConfig;
}

const MatrixSelectorField: React.FC<MatrixSelectorFieldProps> = ({
  field,
  value,
  onChange,
  isAdvanced,
  matrixConfig: externalMatrixConfig
}) => {
  // Get matrix configuration from field options or use provided external config
  const getMatrixConfig = (): MatrixConfig => {
    // Use external config if provided
    if (externalMatrixConfig) {
      return externalMatrixConfig;
    }
    
    // Default configuration if none is provided
    const defaultConfig: MatrixConfig = {
      type: 'matrix-config',
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
    if (field.options && typeof field.options === "object" && !Array.isArray(field.options) &&
        'rows' in field.options && 'columns' in field.options) {
      // Ensure the type property exists
      return {
        type: 'matrix-config',
        ...field.options
      } as MatrixConfig;
    }
    
    return defaultConfig;
  };
  
  const matrixConfig = getMatrixConfig();
  
  // Track internal matrix values (including unselected rows)
  const [internalMatrixValue, setInternalMatrixValue] = useState<MatrixItem[]>([]);

  // Initialize with default values and selection state
  useEffect(() => {
    const initializeMatrix = () => {
      if (!value || !Array.isArray(value) || value.length === 0) {
        // Create initial value based on the configuration with all rows deselected
        const initialValue = matrixConfig.rows.map(row => {
          const item: MatrixItem = {
            id: row.id,
            label: row.label,
            selected: false, // Default to unselected
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
        setInternalMatrixValue(initialValue);
      } else {
        // If we have existing values, ensure they all have the selected property
        const initialValue = matrixConfig.rows.map(row => {
          // Try to find existing row data
          const existingRow = value.find(item => item.id === row.id);
          
          if (existingRow) {
            // Use existing data and ensure selected property exists
            return {
              ...existingRow,
              selected: existingRow.selected !== undefined ? existingRow.selected : true // Default to selected for existing data
            };
          } else {
            // Create a new unselected row with default values
            const newRow: MatrixItem = {
              id: row.id,
              label: row.label,
              selected: false // Default to unselected
            };
            
            // Initialize with default values
            matrixConfig.columns.forEach(col => {
              if (col.type === "number") {
                newRow[col.id] = 1; // Default number value
              } else if (col.type === "checkbox") {
                newRow[col.id] = false; // Default checkbox value
              }
            });
            
            return newRow;
          }
        });
        
        setInternalMatrixValue(initialValue);
      }
    };

    initializeMatrix();
  }, [matrixConfig.rows, matrixConfig.columns]);

  // Update parent when internal values change
  useEffect(() => {
    // Only include selected rows in the onChange event
    const selectedRows = internalMatrixValue.filter(row => row.selected);
    onChange(selectedRows);
  }, [internalMatrixValue, onChange]);

  // Handle row selection toggle
  const handleRowSelection = (rowId: string, selected: boolean) => {
    setInternalMatrixValue(prev => 
      prev.map(row => 
        row.id === rowId ? { ...row, selected } : row
      )
    );
  };
  
  // Toggle all checkboxes in a row
  const handleSelectAllInRow = (rowId: string) => {
    setInternalMatrixValue(prev => {
      const row = prev.find(r => r.id === rowId);
      if (!row) return prev;
      
      const allSelected = areAllCheckboxesSelected(row);
      
      return prev.map(r => {
        if (r.id !== rowId) return r;
        
        const updatedRow = { ...r };
        matrixConfig.columns.forEach(col => {
          if (col.type === "checkbox") {
            updatedRow[col.id] = !allSelected;
          }
        });
        
        return updatedRow;
      });
    });
  };

  // Check if all checkboxes in a row are selected
  const areAllCheckboxesSelected = (row: MatrixItem): boolean => {
    const checkboxColumns = matrixConfig.columns.filter(col => col.type === "checkbox");
    if (checkboxColumns.length === 0) return false;
    return checkboxColumns.every(col => Boolean(row[col.id]));
  };

  // Handle all rows selection
  const handleToggleAllRows = () => {
    const allSelected = internalMatrixValue.every(row => row.selected);
    
    setInternalMatrixValue(prev => 
      prev.map(row => ({ ...row, selected: !allSelected }))
    );
  };

  // Handle value changes for each cell
  const handleValueChange = (rowId: string, columnId: string, newValue: any) => {
    setInternalMatrixValue(prev => 
      prev.map(row => 
        row.id === rowId ? { ...row, [columnId]: newValue } : row
      )
    );
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

  // Organize rows by groups
  const organizeRows = () => {
    // If no groups defined, just return all rows
    if (!matrixConfig.groups || matrixConfig.groups.length === 0) {
      return { ungrouped: matrixConfig.rows.map(row => row.id) };
    }
    
    // Get rows organized by groups
    const groupedRows: Record<string, string[]> = {};
    
    // First add all defined groups
    matrixConfig.groups.forEach(group => {
      groupedRows[group.id] = group.rowIds;
    });
    
    // Find any rows not in a group
    const allGroupedRowIds = Object.values(groupedRows).flat();
    const ungroupedRowIds = matrixConfig.rows
      .map(row => row.id)
      .filter(id => !allGroupedRowIds.includes(id));
    
    // Add ungrouped rows if any exist
    if (ungroupedRowIds.length > 0) {
      groupedRows.ungrouped = ungroupedRowIds;
    }
    
    return groupedRows;
  };

  const groupedRows = organizeRows();
  
  // Get a mapping of row IDs to their corresponding MatrixItem
  const rowMapping: Record<string, MatrixItem> = {};
  internalMatrixValue.forEach(item => {
    rowMapping[item.id] = item;
  });

  // Calculate if all rows are selected
  const areAllRowsSelected = internalMatrixValue.length > 0 && internalMatrixValue.every(row => row.selected);

  return (
    <div className="space-y-2">
      <div>
        <Label htmlFor={field.id} className="font-medium">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {field.helpText && <HelpText>{field.helpText}</HelpText>}
      </div>
      
      {/* Global select all rows control */}
      <div className="flex items-center mb-2 gap-2">
        <Checkbox
          id="select-all-rows"
          checked={areAllRowsSelected}
          onCheckedChange={handleToggleAllRows}
        />
        <Label htmlFor="select-all-rows" className="text-sm">
          {areAllRowsSelected ? "Deselect all rooms" : "Select all rooms"}
        </Label>
      </div>
      
      <div className="overflow-x-auto border rounded-md">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-10">Select</TableHead>
              <TableHead className="w-1/4">Room</TableHead>
              {matrixConfig.columns.map(column => (
                <TableHead key={column.id} className="text-center">
                  {column.label}
                </TableHead>
              ))}
              <TableHead className="w-24 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matrixConfig.groups && matrixConfig.groups.length > 0 ? (
              // Render grouped rows with category headers
              <>
                {matrixConfig.groups.map(group => (
                  <React.Fragment key={group.id}>
                    {/* Group header row */}
                    <TableRow className="bg-muted/20 font-medium">
                      <TableCell 
                        colSpan={matrixConfig.columns.length + 3}
                        className="py-2 px-3 text-sm font-semibold bg-muted"
                        role="rowheader"
                      >
                        {group.label}
                      </TableCell>
                    </TableRow>
                    
                    {/* Group rows */}
                    {group.rowIds.map(rowId => {
                      const rowItem = rowMapping[rowId];
                      // Skip if the row doesn't exist in values
                      if (!rowItem) return null;
                      
                      return (
                        <TableRow 
                          key={rowId}
                          className={rowItem.selected ? "bg-muted/50 border-l-2 border-l-primary" : ""}
                        >
                          <TableCell className="pl-3 pr-0 w-10">
                            <Checkbox 
                              checked={rowItem.selected}
                              onCheckedChange={(checked) => handleRowSelection(rowId, Boolean(checked))}
                              aria-label={`Select ${rowItem.label || rowItem.id}`}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{rowItem.label || rowItem.id}</TableCell>
                          {matrixConfig.columns.map(column => (
                            <TableCell key={`${rowId}-${column.id}`} className="text-center">
                              {renderCell(rowItem, column)}
                            </TableCell>
                          ))}
                          <TableCell className="text-center">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleSelectAllInRow(rowId)}
                              className="text-xs h-7 px-2"
                            >
                              {areAllCheckboxesSelected(rowItem) ? "Deselect All" : "Select All"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </React.Fragment>
                ))}
                
                {/* Ungrouped rows if any */}
                {groupedRows.ungrouped && groupedRows.ungrouped.length > 0 && (
                  <>
                    <TableRow className="bg-muted/20 font-medium">
                      <TableCell 
                        colSpan={matrixConfig.columns.length + 3}
                        className="py-2 px-3 text-sm font-semibold bg-muted"
                        role="rowheader"
                      >
                        Other Rooms
                      </TableCell>
                    </TableRow>
                    
                    {groupedRows.ungrouped.map(rowId => {
                      const rowItem = rowMapping[rowId];
                      if (!rowItem) return null;
                      
                      return (
                        <TableRow 
                          key={rowId}
                          className={rowItem.selected ? "bg-muted/50 border-l-2 border-l-primary" : ""}
                        >
                          <TableCell className="pl-3 pr-0 w-10">
                            <Checkbox 
                              checked={rowItem.selected}
                              onCheckedChange={(checked) => handleRowSelection(rowId, Boolean(checked))}
                              aria-label={`Select ${rowItem.label || rowItem.id}`}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{rowItem.label || rowItem.id}</TableCell>
                          {matrixConfig.columns.map(column => (
                            <TableCell key={`${rowId}-${column.id}`} className="text-center">
                              {renderCell(rowItem, column)}
                            </TableCell>
                          ))}
                          <TableCell className="text-center">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleSelectAllInRow(rowId)}
                              className="text-xs h-7 px-2"
                            >
                              {areAllCheckboxesSelected(rowItem) ? "Deselect All" : "Select All"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </>
                )}
              </>
            ) : (
              // Render rows without groups (backward compatibility)
              internalMatrixValue.map((row) => (
                <TableRow 
                  key={row.id}
                  className={row.selected ? "bg-muted/50 border-l-2 border-l-primary" : ""}
                >
                  <TableCell className="pl-3 pr-0 w-10">
                    <Checkbox 
                      checked={row.selected}
                      onCheckedChange={(checked) => handleRowSelection(row.id, Boolean(checked))}
                      aria-label={`Select ${row.label || row.id}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{row.label || row.id}</TableCell>
                  {matrixConfig.columns.map(column => (
                    <TableCell key={`${row.id}-${column.id}`} className="text-center">
                      {renderCell(row, column)}
                    </TableCell>
                  ))}
                  <TableCell className="text-center">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleSelectAllInRow(row.id)}
                      className="text-xs h-7 px-2"
                    >
                      {areAllCheckboxesSelected(row) ? "Deselect All" : "Select All"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Mobile view with responsive cards */}
      <div className="md:hidden space-y-6 mt-4">
        {/* Mobile global select all control */}
        <div className="flex items-center gap-2 mb-2">
          <Checkbox
            id="mobile-select-all-rows"
            checked={areAllRowsSelected}
            onCheckedChange={handleToggleAllRows}
          />
          <Label htmlFor="mobile-select-all-rows" className="text-sm">
            {areAllRowsSelected ? "Deselect all rooms" : "Select all rooms"}
          </Label>
        </div>
        
        {matrixConfig.groups && matrixConfig.groups.length > 0 ? (
          // Grouped mobile view
          <>
            {matrixConfig.groups.map(group => (
              <div key={group.id} className="space-y-3">
                {/* Group header */}
                <h3 className="text-muted-foreground text-sm font-medium mt-6 mb-2">
                  {group.label}
                </h3>
                
                {/* Group rows */}
                {group.rowIds.map(rowId => {
                  const rowItem = rowMapping[rowId];
                  if (!rowItem) return null;
                  
                  return (
                    <div 
                      key={rowId} 
                      className={`border rounded-md p-4 bg-card ${
                        rowItem.selected ? "bg-muted/50 border-l-4 border-l-primary" : ""
                      }`}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            checked={rowItem.selected}
                            onCheckedChange={(checked) => handleRowSelection(rowId, Boolean(checked))}
                            aria-label={`Select ${rowItem.label || rowItem.id}`}
                          />
                          <h4 className="font-medium">{rowItem.label || rowItem.id}</h4>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleSelectAllInRow(rowId)}
                          className="text-xs h-7 px-2"
                        >
                          {areAllCheckboxesSelected(rowItem) ? "Deselect All" : "Select All"}
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {matrixConfig.columns.map(column => (
                          <div key={`${rowId}-${column.id}`} className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">{column.label}:</span>
                            <div className="ml-2">
                              {renderCell(rowItem, column)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            
            {/* Ungrouped rows if any */}
            {groupedRows.ungrouped && groupedRows.ungrouped.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-muted-foreground text-sm font-medium mt-6 mb-2">
                  Other Rooms
                </h3>
                
                {groupedRows.ungrouped.map(rowId => {
                  const rowItem = rowMapping[rowId];
                  if (!rowItem) return null;
                  
                  return (
                    <div 
                      key={rowId} 
                      className={`border rounded-md p-4 bg-card ${
                        rowItem.selected ? "bg-muted/50 border-l-4 border-l-primary" : ""
                      }`}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            checked={rowItem.selected}
                            onCheckedChange={(checked) => handleRowSelection(rowId, Boolean(checked))}
                            aria-label={`Select ${rowItem.label || rowItem.id}`}
                          />
                          <h4 className="font-medium">{rowItem.label || rowItem.id}</h4>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleSelectAllInRow(rowId)}
                          className="text-xs h-7 px-2"
                        >
                          {areAllCheckboxesSelected(rowItem) ? "Deselect All" : "Select All"}
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {matrixConfig.columns.map(column => (
                          <div key={`${rowId}-${column.id}`} className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">{column.label}:</span>
                            <div className="ml-2">
                              {renderCell(rowItem, column)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          // Ungrouped mobile view
          internalMatrixValue.map((row) => (
            <div 
              key={row.id} 
              className={`border rounded-md p-4 bg-card ${
                row.selected ? "bg-muted/50 border-l-4 border-l-primary" : ""
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    checked={row.selected}
                    onCheckedChange={(checked) => handleRowSelection(row.id, Boolean(checked))}
                    aria-label={`Select ${row.label || row.id}`}
                  />
                  <h4 className="font-medium">{row.label || row.id}</h4>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleSelectAllInRow(row.id)}
                  className="text-xs h-7 px-2"
                >
                  {areAllCheckboxesSelected(row) ? "Deselect All" : "Select All"}
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {matrixConfig.columns.map(column => (
                  <div key={`${row.id}-${column.id}`} className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{column.label}:</span>
                    <div className="ml-2">
                      {renderCell(row, column)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
      
      {matrixConfig.columns.some(col => col.id === "quantity" || col.type === "number") && (
        <p className="text-xs text-muted-foreground mt-1">
          Set quantity to 0 for rooms not included in the project.
        </p>
      )}
      
      <p className="text-xs text-muted-foreground mt-1">
        Only selected rooms will be included in the final proposal.
      </p>
    </div>
  );
};

export default MatrixSelectorField;
