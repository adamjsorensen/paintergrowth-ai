
import { MatrixColumn } from "@/types/prompt-templates";

// Matrix column definitions for different surface types
export const surfaceColumns: MatrixColumn[] = [
  {
    id: "walls",
    label: "Walls",
    type: "checkbox"
  },
  {
    id: "ceiling",
    label: "Ceiling",
    type: "checkbox"
  },
  {
    id: "trim",
    label: "Trim/Baseboards",
    type: "checkbox"
  },
  {
    id: "doors",
    label: "Doors",
    type: "number",
    min: 0,
    step: 1
  },
  {
    id: "windows",
    label: "Windows",
    type: "number",
    min: 0,
    step: 1
  },
  {
    id: "cabinets",
    label: "Cabinets",
    type: "checkbox"
  }
];
