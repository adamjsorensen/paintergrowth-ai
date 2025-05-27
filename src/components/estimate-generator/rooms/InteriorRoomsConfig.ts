
import { MatrixConfig } from "@/types/prompt-templates";
import { surfaceColumns } from "./config/SurfaceColumns";
import { roomRows, roomGroups, floorGroups } from "./config/RoomDefinitions";

// Re-export everything for backward compatibility
export { surfaceColumns } from "./config/SurfaceColumns";
export { roomRows, roomGroups, floorGroups } from "./config/RoomDefinitions";
export { initializeRoomsMatrix } from "./config/MatrixUtils";

// Create the full matrix configuration
export const interiorRoomsMatrixConfig: MatrixConfig = {
  type: 'matrix-config',
  columns: surfaceColumns,
  rows: roomRows,
  groups: roomGroups
};
