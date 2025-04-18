import React from "react";
import {
  TableRow,
  TableCell,
  TableBody
} from "@/components/ui/table";
import { MatrixItem, MatrixGroupProps } from "./types";
import MatrixCell from "./MatrixCell";

const MatrixGroupedRows: React.FC<MatrixGroupProps> = ({ 
  matrixConfig,
  matrixValue,
  rowMapping,
  onChange,
  groupedRows
}) => {
  return (
    <TableBody>
      {matrixConfig.groups && matrixConfig.groups.length > 0 ? (
        // Render grouped rows with category headers
        <>
          {matrixConfig.groups.map(group => (
            <React.Fragment key={group.id}>
              {/* Group header row - sticky */}
              <TableRow className="bg-muted/20 font-medium sticky z-10" style={{ top: '40px' }}>
                <TableCell 
                  colSpan={matrixConfig.columns.length + 1}
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
                
                // Check if row is selected (if that property exists)
                const isSelected = 'selected' in rowItem ? Boolean(rowItem.selected) : true;
                
                return (
                  <TableRow
                    key={rowId}
                    className={isSelected
                      ? "bg-muted/50 border-l-4 border-l-primary shadow-sm"
                      : "opacity-75 hover:opacity-100 transition-opacity"
                    }
                  >
                    <TableCell className={`font-medium px-2 ${isSelected ? "text-primary-foreground" : "text-muted-foreground"}`}>
                      {rowItem.label || rowItem.id}
                    </TableCell>
                    {matrixConfig.columns.map(column => (
                      <TableCell key={`${rowId}-${column.id}`} className="text-center px-1">
                        <MatrixCell row={rowItem} column={column} onChange={onChange} />
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </React.Fragment>
          ))}
          
          {/* Ungrouped rows if any */}
          {groupedRows.ungrouped && groupedRows.ungrouped.length > 0 && (
            <>
              <TableRow className="bg-muted/20 font-medium sticky z-10" style={{ top: '40px' }}>
                <TableCell 
                  colSpan={matrixConfig.columns.length + 1}
                  className="py-2 px-3 text-sm font-semibold bg-muted"
                  role="rowheader"
                >
                  Other Rooms
                </TableCell>
              </TableRow>
              
              {groupedRows.ungrouped.map(rowId => {
                const rowItem = rowMapping[rowId];
                if (!rowItem) return null;
                
                // Check if row is selected (if that property exists)
                const isSelected = 'selected' in rowItem ? Boolean(rowItem.selected) : true;
                
                return (
                  <TableRow
                    key={rowId}
                    className={isSelected
                      ? "bg-muted/50 border-l-4 border-l-primary shadow-sm"
                      : "opacity-75 hover:opacity-100 transition-opacity"
                    }
                  >
                    <TableCell className={`font-medium px-2 ${isSelected ? "text-primary-foreground" : "text-muted-foreground"}`}>
                      {rowItem.label || rowItem.id}
                    </TableCell>
                    {matrixConfig.columns.map(column => (
                      <TableCell key={`${rowId}-${column.id}`} className="text-center px-1">
                        <MatrixCell row={rowItem} column={column} onChange={onChange} />
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </>
          )}
        </>
      ) : (
        // Render rows without groups (backward compatibility)
        matrixValue.map((row) => {
          // Check if row is selected (if that property exists)
          const isSelected = 'selected' in row ? Boolean(row.selected) : true;
          
          return (
            <TableRow
              key={row.id}
              className={isSelected
                ? "bg-muted/50 border-l-4 border-l-primary shadow-sm"
                : "opacity-75 hover:opacity-100 transition-opacity"
              }
            >
              <TableCell className={`font-medium px-2 ${isSelected ? "text-primary-foreground" : "text-muted-foreground"}`}>
                {row.label || row.id}
              </TableCell>
              {matrixConfig.columns.map(column => (
                <TableCell key={`${row.id}-${column.id}`} className="text-center px-1">
                  <MatrixCell row={row} column={column} onChange={onChange} />
                </TableCell>
              ))}
            </TableRow>
          );
        })
      )}
    </TableBody>
  );
};

export default MatrixGroupedRows;