import React from "react";
import { MatrixConfig } from "@/types/prompt-templates";
import { MatrixItem } from "./types";
import MatrixCell from "./MatrixCell";

interface MatrixMobileViewProps {
  matrixConfig: MatrixConfig;
  matrixValue: MatrixItem[];
  rowMapping: Record<string, MatrixItem>;
  onChange: (rowId: string, columnId: string, value: any) => void;
  groupedRows: Record<string, string[]>;
}

const MatrixMobileView: React.FC<MatrixMobileViewProps> = ({ 
  matrixConfig,
  matrixValue,
  rowMapping,
  onChange,
  groupedRows
}) => {
  return (
    <div className="md:hidden space-y-4 mt-4">
      {matrixConfig.groups && matrixConfig.groups.length > 0 ? (
        // Grouped mobile view
        <>
          {matrixConfig.groups.map(group => (
            <div key={group.id} className="space-y-2">
              {/* Group header - sticky on mobile */}
              <h3 className="text-muted-foreground text-sm font-medium pt-2 pb-1 sticky top-0 z-10 bg-background border-b">
                {group.label}
              </h3>
              
              {/* Group rows */}
              {group.rowIds.map(rowId => {
                const rowItem = rowMapping[rowId];
                if (!rowItem) return null;
                
                // Check if row is selected (if that property exists)
                const isSelected = 'selected' in rowItem ? Boolean(rowItem.selected) : true;
                
                return (
                  <div
                    key={rowId}
                    className={`border rounded-md p-3 ${
                      isSelected
                        ? "bg-muted/30 border-l-4 border-l-primary shadow-sm"
                        : "opacity-75 bg-card"
                    }`}
                  >
                    <h4 className={`font-medium mb-2 ${isSelected ? "text-primary-foreground" : "text-muted-foreground"}`}>
                      {rowItem.label || rowItem.id}
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {matrixConfig.columns.map(column => (
                        <div key={`${rowId}-${column.id}`} className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">{column.label}:</span>
                          <div className="ml-2">
                            <MatrixCell row={rowItem} column={column} onChange={onChange} />
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
            <div className="space-y-2">
              <h3 className="text-muted-foreground text-sm font-medium pt-2 pb-1 sticky top-0 z-10 bg-background border-b">
                Other Rooms
              </h3>
              
              {groupedRows.ungrouped.map(rowId => {
                const rowItem = rowMapping[rowId];
                if (!rowItem) return null;
                
                // Check if row is selected (if that property exists)
                const isSelected = 'selected' in rowItem ? Boolean(rowItem.selected) : true;
                
                return (
                  <div
                    key={rowId}
                    className={`border rounded-md p-3 ${
                      isSelected
                        ? "bg-muted/30 border-l-4 border-l-primary shadow-sm"
                        : "opacity-75 bg-card"
                    }`}
                  >
                    <h4 className={`font-medium mb-2 ${isSelected ? "text-primary-foreground" : "text-muted-foreground"}`}>
                      {rowItem.label || rowItem.id}
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {matrixConfig.columns.map(column => (
                        <div key={`${rowId}-${column.id}`} className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">{column.label}:</span>
                          <div className="ml-2">
                            <MatrixCell row={rowItem} column={column} onChange={onChange} />
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
        matrixValue.map((row) => {
          // Check if row is selected (if that property exists)
          const isSelected = 'selected' in row ? Boolean(row.selected) : true;
          
          return (
            <div
              key={row.id}
              className={`border rounded-md p-3 ${
                isSelected
                  ? "bg-muted/30 border-l-4 border-l-primary shadow-sm"
                  : "opacity-75 bg-card"
              }`}
            >
              <h4 className={`font-medium mb-2 ${isSelected ? "text-primary-foreground" : "text-muted-foreground"}`}>
                {row.label || row.id}
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {matrixConfig.columns.map(column => (
                  <div key={`${row.id}-${column.id}`} className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{column.label}:</span>
                    <div className="ml-2">
                      <MatrixCell row={row} column={column} onChange={onChange} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default MatrixMobileView;