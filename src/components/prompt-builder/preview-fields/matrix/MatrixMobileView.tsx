
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
    <div className="md:hidden space-y-6 mt-4">
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
                  <div key={rowId} className="border rounded-md p-4 bg-card">
                    <h4 className="font-medium mb-3">{rowItem.label || rowItem.id}</h4>
                    <div className="grid grid-cols-2 gap-3">
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
            <div className="space-y-3">
              <h3 className="text-muted-foreground text-sm font-medium mt-6 mb-2">
                Other Rooms
              </h3>
              
              {groupedRows.ungrouped.map(rowId => {
                const rowItem = rowMapping[rowId];
                if (!rowItem) return null;
                
                return (
                  <div key={rowId} className="border rounded-md p-4 bg-card">
                    <h4 className="font-medium mb-3">{rowItem.label || rowItem.id}</h4>
                    <div className="grid grid-cols-2 gap-3">
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
        matrixValue.map((row) => (
          <div key={row.id} className="border rounded-md p-4 bg-card">
            <h4 className="font-medium mb-3">{row.label || row.id}</h4>
            <div className="grid grid-cols-2 gap-3">
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
        ))
      )}
    </div>
  );
};

export default MatrixMobileView;
