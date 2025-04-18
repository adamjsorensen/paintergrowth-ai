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

export interface MatrixItem {
  id: string;
  selected?: boolean;
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
  const getMatrixConfig = (): MatrixConfig => {
    if (externalMatrixConfig) {
      return externalMatrixConfig;
    }
    
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
    
    if (field.options && typeof field.options === "object" && !Array.isArray(field.options) &&
        'rows' in field.options && 'columns' in field.options) {
      return {
        type: 'matrix-config',
        ...field.options
      } as MatrixConfig;
    }
    
    return defaultConfig;
  };
  
  const matrixConfig = getMatrixConfig();
  
  const [internalMatrixValue, setInternalMatrixValue] = useState<MatrixItem[]>([]);

  useEffect(() => {
    const initializeMatrix = () => {
      if (!value || !Array.isArray(value) || value.length === 0) {
        const initialValue = matrixConfig.rows.map(row => {
          const item: MatrixItem = {
            id: row.id,
            label: row.label,
            selected: false,
          };
          
          matrixConfig.columns.forEach(col => {
            if (col.type === "number") {
              item[col.id] = 1;
            } else if (col.type === "checkbox") {
              item[col.id] = false;
            }
          });
          
          return item;
        });
        setInternalMatrixValue(initialValue);
      } else {
        const initialValue = matrixConfig.rows.map(row => {
          const existingRow = value.find(item => item.id === row.id);
          
          if (existingRow) {
            return {
              ...existingRow,
              selected: existingRow.selected !== undefined ? existingRow.selected : true
            };
          } else {
            const newRow: MatrixItem = {
              id: row.id,
              label: row.label,
              selected: false
            };
            
            matrixConfig.columns.forEach(col => {
              if (col.type === "number") {
                newRow[col.id] = 1;
              } else if (col.type === "checkbox") {
                newRow[col.id] = false;
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

  useEffect(() => {
    const selectedRows = internalMatrixValue.filter(row => row.selected);
    onChange(selectedRows);
  }, [internalMatrixValue, onChange]);

  const handleRowSelection = (rowId: string, selected: boolean) => {
    setInternalMatrixValue(prev => 
      prev.map(row => 
        row.id === rowId ? { ...row, selected } : row
      )
    );
  };
  
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

  const areAllCheckboxesSelected = (row: MatrixItem): boolean => {
    const checkboxColumns = matrixConfig.columns.filter(col => col.type === "checkbox");
    if (checkboxColumns.length === 0) return false;
    return checkboxColumns.every(col => Boolean(row[col.id]));
  };

  const handleToggleAllRows = () => {
    const allSelected = internalMatrixValue.every(row => row.selected);
    
    setInternalMatrixValue(prev => 
      prev.map(row => ({ ...row, selected: !allSelected }))
    );
  };

  const handleValueChange = (rowId: string, columnId: string, newValue: any) => {
    setInternalMatrixValue(prev => 
      prev.map(row => 
        row.id === rowId ? { ...row, [columnId]: newValue } : row
      )
    );
  };

  const renderCell = (row: MatrixItem, column: { id: string; type: string; label: string }) => {
    if (column.type === "number") {
      return (
        <Input
          type="number"
          min="0"
          value={row[column.id] as number}
          onChange={(e) => handleValueChange(row.id, column.id, parseInt(e.target.value) || 0)}
          className="h-8 w-14 text-center"
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

  const organizeRows = () => {
    if (!matrixConfig.groups || matrixConfig.groups.length === 0) {
      return { ungrouped: matrixConfig.rows.map(row => row.id) };
    }
    
    const groupedRows: Record<string, string[]> = {};
    
    matrixConfig.groups.forEach(group => {
      groupedRows[group.id] = group.rowIds;
    });
    
    const allGroupedRowIds = Object.values(groupedRows).flat();
    const ungroupedRowIds = matrixConfig.rows
      .map(row => row.id)
      .filter(id => !allGroupedRowIds.includes(id));
    
    if (ungroupedRowIds.length > 0) {
      groupedRows.ungrouped = ungroupedRowIds;
    }
    
    return groupedRows;
  };

  const groupedRows = organizeRows();
  
  const rowMapping: Record<string, MatrixItem> = {};
  internalMatrixValue.forEach(item => {
    rowMapping[item.id] = item;
  });

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
      
      <div className="overflow-auto border rounded-md max-h-[70vh]">
        <Table className="relative">
          <TableHeader className="sticky top-0 z-30 bg-background">
            <TableRow className="bg-muted/50">
              <TableHead className="pl-2 pr-0 w-10">Select</TableHead>
              <TableHead className="w-1/4 px-2">Room</TableHead>
              {matrixConfig.columns.map(column => (
                <TableHead key={column.id} className="text-center px-1">
                  {column.label}
                </TableHead>
              ))}
              <TableHead className="w-20 text-center px-1">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matrixConfig.groups && matrixConfig.groups.length > 0 ? (
              <>
                {matrixConfig.groups.map(group => (
                  <React.Fragment key={group.id}>
                    <TableRow className="bg-muted/20 font-medium sticky z-20" style={{ top: '40px' }}>
                      <TableCell 
                        colSpan={matrixConfig.columns.length + 3}
                        className="py-2 px-3 text-sm font-semibold bg-muted"
                        role="rowheader"
                      >
                        {group.label}
                      </TableCell>
                    </TableRow>
                    
                    {group.rowIds.map(rowId => {
                      const rowItem = rowMapping[rowId];
                      if (!rowItem) return null;
                      
                      return (
                        <TableRow 
                          key={rowId}
                          className={rowItem.selected
                            ? "bg-muted/50 border-l-4 border-l-primary shadow-sm"
                            : "opacity-75 hover:opacity-100 transition-opacity"}
                        >
                          <TableCell className="pl-2 pr-0 w-10">
                            <Checkbox 
                              checked={rowItem.selected}
                              onCheckedChange={(checked) => handleRowSelection(rowId, Boolean(checked))}
                              aria-label={`Select ${rowItem.label || rowItem.id}`}
                            />
                          </TableCell>
                          <TableCell className={`font-medium px-2 ${rowItem.selected ? "text-primary-foreground" : "text-muted-foreground"}`}>
                            {rowItem.label || rowItem.id}
                          </TableCell>
                          {matrixConfig.columns.map(column => (
                            <TableCell key={`${rowId}-${column.id}`} className="text-center px-1">
                              {renderCell(rowItem, column)}
                            </TableCell>
                          ))}
                          <TableCell className="text-center px-1">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleSelectAllInRow(rowId)}
                              className="text-xs h-7 px-1 w-full"
                            >
                              {areAllCheckboxesSelected(rowItem) ? "Deselect" : "Select"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </React.Fragment>
                ))}
                
                {groupedRows.ungrouped && groupedRows.ungrouped.length > 0 && (
                  <>
                    <TableRow className="bg-muted/20 font-medium sticky z-20" style={{ top: '40px' }}>
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
                          className={rowItem.selected
                            ? "bg-muted/50 border-l-4 border-l-primary shadow-sm"
                            : "opacity-75 hover:opacity-100 transition-opacity"}
                        >
                          <TableCell className="pl-2 pr-0 w-10">
                            <Checkbox 
                              checked={rowItem.selected}
                              onCheckedChange={(checked) => handleRowSelection(rowId, Boolean(checked))}
                              aria-label={`Select ${rowItem.label || rowItem.id}`}
                            />
                          </TableCell>
                          <TableCell className={`font-medium px-2 ${rowItem.selected ? "text-primary-foreground" : "text-muted-foreground"}`}>
                            {rowItem.label || rowItem.id}
                          </TableCell>
                          {matrixConfig.columns.map(column => (
                            <TableCell key={`${rowId}-${column.id}`} className="text-center px-1">
                              {renderCell(rowItem, column)}
                            </TableCell>
                          ))}
                          <TableCell className="text-center px-1">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleSelectAllInRow(rowId)}
                              className="text-xs h-7 px-1 w-full"
                            >
                              {areAllCheckboxesSelected(rowItem) ? "Deselect" : "Select"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </>
                )}
              </>
            ) : (
              internalMatrixValue.map((row) => (
                <TableRow 
                  key={row.id}
                  className={row.selected
                    ? "bg-muted/50 border-l-4 border-l-primary shadow-sm"
                    : "opacity-75 hover:opacity-100 transition-opacity"}
                >
                  <TableCell className="pl-2 pr-0 w-10">
                    <Checkbox 
                      checked={row.selected}
                      onCheckedChange={(checked) => handleRowSelection(row.id, Boolean(checked))}
                      aria-label={`Select ${row.label || row.id}`}
                    />
                  </TableCell>
                  <TableCell className={`font-medium px-2 ${row.selected ? "text-primary-foreground" : "text-muted-foreground"}`}>
                    {row.label || row.id}
                  </TableCell>
                  {matrixConfig.columns.map(column => (
                    <TableCell key={`${row.id}-${column.id}`} className="text-center px-1">
                      {renderCell(row, column)}
                    </TableCell>
                  ))}
                  <TableCell className="text-center px-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleSelectAllInRow(row.id)}
                      className="text-xs h-7 px-1 w-full"
                    >
                      {areAllCheckboxesSelected(row) ? "Deselect" : "Select"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="md:hidden space-y-4 mt-4">
        <div className="flex items-center gap-2 mb-2 sticky top-0 z-10 bg-background pt-2 pb-2">
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
          <>
            {matrixConfig.groups.map(group => (
              <div key={group.id} className="space-y-2">
                <h3 className="text-muted-foreground text-sm font-medium pt-2 pb-1 sticky top-12 z-10 bg-background border-b">
                  {group.label}
                </h3>
                
                {group.rowIds.map(rowId => {
                  const rowItem = rowMapping[rowId];
                  if (!rowItem) return null;
                  
                  return (
                    <div 
                      key={rowId} 
                      className={`border rounded-md p-3 ${
                        rowItem.selected
                          ? "bg-muted/30 border-l-4 border-l-primary shadow-sm"
                          : "opacity-75 bg-card"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            checked={rowItem.selected}
                            onCheckedChange={(checked) => handleRowSelection(rowId, Boolean(checked))}
                            aria-label={`Select ${rowItem.label || rowItem.id}`}
                          />
                          <h4 className={`font-medium ${rowItem.selected ? "text-primary-foreground" : "text-muted-foreground"}`}>
                            {rowItem.label || rowItem.id}
                          </h4>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleSelectAllInRow(rowId)}
                          className="text-xs h-7 px-2"
                        >
                          {areAllCheckboxesSelected(rowItem) ? "Deselect" : "Select"}
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
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
            
            {groupedRows.ungrouped && groupedRows.ungrouped.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-muted-foreground text-sm font-medium pt-2 pb-1 sticky top-12 z-10 bg-background border-b">
                  Other Rooms
                </h3>
                
                {groupedRows.ungrouped.map(rowId => {
                  const rowItem = rowMapping[rowId];
                  if (!rowItem) return null;
                  
                  return (
                    <div 
                      key={rowId} 
                      className={`border rounded-md p-3 ${
                        rowItem.selected
                          ? "bg-muted/30 border-l-4 border-l-primary shadow-sm"
                          : "opacity-75 bg-card"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            checked={rowItem.selected}
                            onCheckedChange={(checked) => handleRowSelection(rowId, Boolean(checked))}
                            aria-label={`Select ${rowItem.label || rowItem.id}`}
                          />
                          <h4 className={`font-medium ${rowItem.selected ? "text-primary-foreground" : "text-muted-foreground"}`}>
                            {rowItem.label || rowItem.id}
                          </h4>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleSelectAllInRow(rowId)}
                          className="text-xs h-7 px-2"
                        >
                          {areAllCheckboxesSelected(rowItem) ? "Deselect" : "Select"}
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
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
          internalMatrixValue.map((row) => (
            <div 
              key={row.id} 
              className={`border rounded-md p-3 ${
                row.selected
                  ? "bg-muted/30 border-l-4 border-l-primary shadow-sm"
                  : "opacity-75 bg-card"
              }`}
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    checked={row.selected}
                    onCheckedChange={(checked) => handleRowSelection(row.id, Boolean(checked))}
                    aria-label={`Select ${row.label || row.id}`}
                  />
                  <h4 className={`font-medium ${row.selected ? "text-primary-foreground" : "text-muted-foreground"}`}>
                    {row.label || row.id}
                  </h4>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleSelectAllInRow(row.id)}
                  className="text-xs h-7 px-2"
                >
                  {areAllCheckboxesSelected(row) ? "Deselect" : "Select"}
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
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
