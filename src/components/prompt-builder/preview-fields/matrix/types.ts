
import { MatrixConfig } from "@/types/prompt-templates";

// Interface for matrix items in the form
export interface MatrixItem {
  id: string;
  label?: string;
  selected?: boolean; // Added to track row selection
  [key: string]: string | number | boolean | undefined;
}

export interface MatrixGroupProps {
  matrixConfig: MatrixConfig;
  matrixValue: MatrixItem[];
  rowMapping: Record<string, MatrixItem>;
  onChange: (rowId: string, columnId: string, value: any) => void;
  groupedRows: Record<string, string[]>;
}
