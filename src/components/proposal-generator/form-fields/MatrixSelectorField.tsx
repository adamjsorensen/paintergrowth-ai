import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { FieldConfig, MatrixConfig, MatrixColumn } from "@/types/prompt-templates";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpText } from "./components/HelpText";
import { MinusCircle, PlusCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

// Define the structure of a matrix row for the form data
export interface MatrixItem {
  id: string;
  label?: string; // Ensure label is present
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
  const getMatrixConfig = useCallback((): MatrixConfig => {
    if (externalMatrixConfig) return externalMatrixConfig;
    
    const defaultConfig: MatrixConfig = {
      type: 'matrix-config',
      rows: [{ id: "kitchen", label: "Kitchen" }],
      columns: [
        { id: "walls", label: "Walls", type: "checkbox" },
        { id: "ceiling", label: "Ceiling", type: "checkbox" },
      ],
      quantityColumnId: "quantity" // Example default
    };
    
    if (field.options && typeof field.options === "object" && !Array.isArray(field.options) &&
        'rows' in field.options && 'columns' in field.options) {
      return { type: 'matrix-config', ...field.options } as MatrixConfig;
    }
    
    return defaultConfig;
  }, [field.options, externalMatrixConfig]);
  
  const matrixConfig = useMemo(() => getMatrixConfig(), [getMatrixConfig]);
  
  const [internalMatrixValue, setInternalMatrixValue] = useState<MatrixItem[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const isInitialized = useRef<boolean>(false);

  // Initialize internal state based on config and incoming value
  useEffect(() => {
    if (isInitialized.current) return;

    const initialValue = matrixConfig.rows.map(row => {
      const existingRow = value?.find(item => item.id === row.id);
      const defaultItem: MatrixItem = {
        id: row.id,
        label: row.label,
        selected: false,
      };

      matrixConfig.columns.forEach(col => {
        if (col.type === "number" || col.id === matrixConfig.quantityColumnId) {
          defaultItem[col.id] = 1; // Default quantity/number
        } else if (col.type === "checkbox") {
          defaultItem[col.id] = false; // Default checkbox
        } else {
          defaultItem[col.id] = ""; // Default text
        }
      });

      if (existingRow) {
        // Merge existing data, ensuring all config columns are present
        const mergedItem = { ...defaultItem, ...existingRow };
        // Ensure 'selected' is explicitly boolean, default to true if exists but undefined
        mergedItem.selected = existingRow.selected !== undefined ? existingRow.selected : true;
        return mergedItem;
      } else {
        return defaultItem;
      }
    });

    setInternalMatrixValue(initialValue);
    // Default expand all groups that have at least one selected item initially
    const initiallySelectedGroupIds = matrixConfig.groups
      ?.filter(group => group.rowIds.some(rowId => initialValue.find(item => item.id === rowId)?.selected))
      .map(group => group.id) ?? [];
    // If no groups have selected items, expand the first group by default
    const defaultExpanded = initiallySelectedGroupIds.length > 0
      ? initiallySelectedGroupIds
      : (matrixConfig.groups && matrixConfig.groups.length > 0 ? [matrixConfig.groups[0].id] : []);
      
    setExpandedGroups(defaultExpanded);
    isInitialized.current = true;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matrixConfig, value]); // Rerun if config or external value changes

  // Debounced onChange handler
  const debouncedOnChange = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (!isInitialized.current) return;

    if (debouncedOnChange.current) clearTimeout(debouncedOnChange.current);

    debouncedOnChange.current = setTimeout(() => {
      const selectedRows = internalMatrixValue.filter(row => row.selected);
      onChange(selectedRows);
    }, 100); // Increased debounce slightly

    return () => {
      if (debouncedOnChange.current) clearTimeout(debouncedOnChange.current);
    };
  }, [internalMatrixValue, onChange]);

  // --- Event Handlers ---

  const handleRowSelection = useCallback((rowId: string, selected: boolean) => {
    setInternalMatrixValue(prev => 
      prev.map(row => {
        if (row.id === rowId) {
          const updatedRow = { ...row, selected };
          // If selecting, set default checkbox values to true
          // If deselecting, set all checkbox values to false
          matrixConfig.columns.forEach(col => {
            if (col.type === "checkbox") {
              updatedRow[col.id] = selected;
            }
            // Optionally reset quantity/number fields on deselect? Decided against for now.
            // if (!selected && (col.type === "number" || col.id === matrixConfig.quantityColumnId)) {
            //   updatedRow[col.id] = 1;
            // }
          });
          return updatedRow;
        }
        return row;
      })
    );
  }, [matrixConfig.columns, matrixConfig.quantityColumnId]);

  const handleValueChange = useCallback((rowId: string, columnId: string, newValue: any) => {
    setInternalMatrixValue(prev =>
      prev.map(row => 
        row.id === rowId ? { ...row, [columnId]: newValue } : row
      )
    );
  }, []);

  const handleQuantityChange = useCallback((rowId: string, increment: number) => {
    if (!matrixConfig.quantityColumnId) return;
    const qtyColId = matrixConfig.quantityColumnId;

    setInternalMatrixValue(prev => 
      prev.map(row => {
        if (row.id === rowId) {
          const currentQty = Number(row[qtyColId]) || 0;
          const newQty = Math.max(1, currentQty + increment); // Ensure quantity is at least 1
          return { ...row, [qtyColId]: newQty };
        }
        return row;
      })
    );
  }, [matrixConfig.quantityColumnId]);

  const handleGroupSelection = useCallback((groupId: string, selected: boolean) => {
    const group = matrixConfig.groups?.find(g => g.id === groupId);
    if (!group) return;

    setInternalMatrixValue(prev => 
      prev.map(row => {
        if (group.rowIds.includes(row.id)) {
          const updatedRow = { ...row, selected };
          // Apply same logic as individual row selection for sub-items
          matrixConfig.columns.forEach(col => {
            if (col.type === "checkbox") {
              updatedRow[col.id] = selected;
            }
          });
          return updatedRow;
        }
        return row;
      })
    );
  }, [matrixConfig.groups, matrixConfig.columns]);

  // --- Memos ---

  const groupedRows = useMemo(() => {
    const result: Record<string, string[]> = {};
    const allRowIdsInGroups = new Set<string>();

    if (matrixConfig.groups) {
      matrixConfig.groups.forEach(group => {
        result[group.id] = group.rowIds;
        group.rowIds.forEach(id => allRowIdsInGroups.add(id));
      });
    }

    const ungroupedRowIds = matrixConfig.rows
      .map(row => row.id)
      .filter(id => !allRowIdsInGroups.has(id));

    if (ungroupedRowIds.length > 0) {
      result.ungrouped = ungroupedRowIds;
    }

    return result;
  }, [matrixConfig.groups, matrixConfig.rows]);

  const rowMapping = useMemo(() => {
    const mapping: Record<string, MatrixItem> = {};
    internalMatrixValue.forEach(item => {
      mapping[item.id] = item;
    });
    return mapping;
  }, [internalMatrixValue]);

  // --- Rendering Functions ---

  const renderSubItemControl = (row: MatrixItem, column: MatrixColumn) => {
    const commonProps = {
      id: `${field.id}-${row.id}-${column.id}`,
      key: `${row.id}-${column.id}`,
    };

    const control = (() => {
      switch (column.type) {
        case "checkbox":
          return (
            <Checkbox
              {...commonProps}
              checked={Boolean(row[column.id])}
              onCheckedChange={(checked) => handleValueChange(row.id, column.id, Boolean(checked))}
              className="mr-2 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
            />
          );
        case "number":
          // Exclude quantity column if handled separately
          if (column.id === matrixConfig.quantityColumnId) return null;
          return (
            <Input
              {...commonProps}
              type="number"
              min="0"
              value={row[column.id] as number ?? 0}
              onChange={(e) => handleValueChange(row.id, column.id, parseInt(e.target.value) || 0)}
              className="h-8 w-20 text-sm"
            />
          );
        case "text":
           return (
            <Input
              {...commonProps}
              type="text"
              value={row[column.id] as string ?? ""}
              onChange={(e) => handleValueChange(row.id, column.id, e.target.value)}
              className="h-8 text-sm"
            />
          );
        default:
          return null;
      }
    })();

    if (!control) return null;

    return (
      <div className="flex items-center space-x-1">
        {control}
        <Label htmlFor={commonProps.id} className="text-sm font-normal text-gray-700 flex-grow whitespace-nowrap">
          {column.label}
        </Label>
        {column.tooltip && (
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-5 w-5 text-gray-400 hover:text-gray-600">
                <Info size={14} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs text-xs">
              <p>{column.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    );
  };

  const renderRowItem = (rowId: string) => {
    const row = rowMapping[rowId];
    if (!row) return null;

    const qtyColId = matrixConfig.quantityColumnId;
    const showQuantityControls = qtyColId && matrixConfig.columns.some(c => c.id === qtyColId);

    return (
      <div
        key={row.id}
        className={cn(
          "p-4 border rounded-lg transition-colors duration-150 mb-3",
          row.selected ? 'border-blue-500 bg-blue-50/50 shadow-sm' : 'border-gray-200 hover:border-gray-300'
        )}
      >
        {/* Row Header: Checkbox, Label, Quantity */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center flex-grow mr-4">
            <Checkbox
              id={`${field.id}-${row.id}-select`}
              checked={row.selected}
              onCheckedChange={(checked) => handleRowSelection(row.id, Boolean(checked))}
              className="mr-3 h-5 w-5 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              aria-label={`Select ${row.label || row.id}`}
            />
            <Label htmlFor={`${field.id}-${row.id}-select`} className="font-medium text-gray-800 cursor-pointer">
              {row.label || row.id}
            </Label>
          </div>

          {showQuantityControls && qtyColId && (
            <div className="flex items-center space-x-1.5 flex-shrink-0">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleQuantityChange(row.id, -1)}
                className="text-gray-500 hover:text-blue-600 h-7 w-7 rounded-full"
                aria-label={`Decrease quantity for ${row.label || row.id}`}
                disabled={(Number(row[qtyColId]) || 0) <= 1}
              >
                <MinusCircle size={18} className={ (Number(row[qtyColId]) || 0) <= 1 ? 'opacity-50' : ''} />
              </Button>
              <span className="mx-1 w-8 text-center font-medium text-sm tabular-nums">
                {row[qtyColId]}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleQuantityChange(row.id, 1)}
                className="text-gray-500 hover:text-blue-600 h-7 w-7 rounded-full"
                aria-label={`Increase quantity for ${row.label || row.id}`}
              >
                <PlusCircle size={18} />
              </Button>
            </div>
          )}
        </div>

        {/* Sub-items (conditionally rendered) */}
        {row.selected && (
          <div className="mt-4 pl-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3">
            {matrixConfig.columns
              .filter(col => col.id !== qtyColId) // Don't render quantity column here if handled above
              .map(column => renderSubItemControl(row, column))}
          </div>
        )}
      </div>
    );
  };

  // --- Main Render ---

  return (
    <TooltipProvider>
      <div className="space-y-3">
        <div>
          <Label htmlFor={field.id} className="text-base font-semibold text-gray-800">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {field.helpText && <HelpText>{field.helpText}</HelpText>}
        </div>

        <Accordion
          type="multiple"
          value={expandedGroups}
          onValueChange={setExpandedGroups}
          className="w-full space-y-3"
        >
          {matrixConfig.groups ? (
            matrixConfig.groups.map(group => {
              const allInGroup = group.rowIds.map(id => rowMapping[id]).filter(Boolean);
              const areAllSelected = allInGroup.length > 0 && allInGroup.every(r => r.selected);
              const areSomeSelected = allInGroup.some(r => r.selected);
              const checkboxState = areAllSelected ? true : (areSomeSelected ? 'indeterminate' : false);

              return (
                <AccordionItem value={group.id} key={group.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                  <AccordionTrigger className="bg-gray-50 hover:bg-gray-100 px-4 py-3 text-left text-sm font-medium text-gray-700 [&[data-state=open]>svg]:rotate-180">
                    {group.label}
                  </AccordionTrigger>
                  <AccordionContent className="p-4 pt-3 border-t border-gray-200">
                    {/* Select all in group */}
                    <div className="flex items-center mb-4 pb-3 border-b border-gray-100">
                      <Checkbox
                        id={`select-all-${group.id}`}
                        checked={checkboxState}
                        onCheckedChange={(checked) => handleGroupSelection(group.id, Boolean(checked))}
                        className="mr-2 h-4 w-4 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=indeterminate]:bg-blue-300 data-[state=indeterminate]:border-blue-300"
                        aria-label={`Select all rooms in ${group.label}`}
                      />
                      <Label htmlFor={`select-all-${group.id}`} className="text-sm font-medium text-gray-600">
                        Select all in {group.label}
                      </Label>
                    </div>
                    {/* Group rows */}
                    <div className="space-y-3">
                      {group.rowIds.map(rowId => renderRowItem(rowId))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })
          ) : (
            // Render ungrouped rows directly if no groups defined
            <div className="space-y-3 border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
              {matrixConfig.rows.map(row => renderRowItem(row.id))}
            </div>
          )}

          {/* Render ungrouped rows if they exist */}
          {groupedRows.ungrouped && groupedRows.ungrouped.length > 0 && (
             <AccordionItem value="ungrouped" key="ungrouped" className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
               <AccordionTrigger className="bg-gray-50 hover:bg-gray-100 px-4 py-3 text-left text-sm font-medium text-gray-700 [&[data-state=open]>svg]:rotate-180">
                 Other Items
               </AccordionTrigger>
               <AccordionContent className="p-4 pt-3 border-t border-gray-200">
                 {/* Select all in ungrouped */}
                 <div className="flex items-center mb-4 pb-3 border-b border-gray-100">
                   <Checkbox
                     id={`select-all-ungrouped`}
                     checked={groupedRows.ungrouped.every(id => rowMapping[id]?.selected)}
                     onCheckedChange={(checked) => {
                       groupedRows.ungrouped.forEach(rowId => handleRowSelection(rowId, Boolean(checked)));
                     }}
                     className="mr-2 h-4 w-4 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                     aria-label={`Select all other items`}
                   />
                   <Label htmlFor={`select-all-ungrouped`} className="text-sm font-medium text-gray-600">
                     Select all other items
                   </Label>
                 </div>
                 {/* Ungrouped rows */}
                 <div className="space-y-3">
                   {groupedRows.ungrouped.map(rowId => renderRowItem(rowId))}
                 </div>
               </AccordionContent>
             </AccordionItem>
          )}
        </Accordion>

        <p className="text-xs text-muted-foreground mt-2">
          Select the areas included in the scope. Only selected items will be added to the proposal.
        </p>
      </div>
    </TooltipProvider>
  );
};

export default MatrixSelectorField;