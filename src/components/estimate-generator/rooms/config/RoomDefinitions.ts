import { MatrixRow, MatrixGroup } from "../types";
import { roomTemplates, transitionalRooms, floorGroups, createRoomInstance } from "./RoomTemplates";

// Generate room rows from templates (create initial instances)
export const roomRows: MatrixRow[] = [
  // Create one instance of each template
  ...roomTemplates.map(template => {
    const instance = createRoomInstance(template, 1);
    return {
      id: instance.id,
      label: instance.label,
      group: `${template.floor}-floor`,
      floor: template.floor as 'main' | 'upper' | 'basement'
    };
  }),
  
  // Add transitional rooms
  ...transitionalRooms.map(template => {
    const instance = createRoomInstance(template, 1);
    return {
      id: instance.id,
      label: instance.label,
      group: 'transitional',
      floor: template.floor as 'main' | 'upper' | 'basement'
    };
  })
];

// Update room groups to use floor-based organization
export const roomGroups: MatrixGroup[] = floorGroups.map(group => ({
  ...group,
  rowIds: roomRows
    .filter(row => row.group === group.id)
    .map(row => row.id)
}));

// Keep floor groups for backward compatibility
export const floorGroups2 = [
  { id: "main", label: "Main Floor" },
  { id: "upper", label: "Upper Floor" },
  { id: "basement", label: "Basement" }
];
