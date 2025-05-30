
import { StandardizedRoom, MatrixRoom } from "@/types/room-types";
import { roomRows } from "./RoomDefinitions";
import { roomTemplates, transitionalRooms } from "./RoomTemplates";

// Helper function to initialize matrix values with standardized room objects
export const initializeRoomsMatrix = (extractedRooms?: Record<string, StandardizedRoom>): MatrixRoom[] => {
  console.log('initializeRoomsMatrix - Input extracted rooms:', extractedRooms);
  
  const defaultMatrix: MatrixRoom[] = [];
  
  // Create an entry for each room with default values
  roomRows.forEach(row => {
    // Find the template for this room
    const allTemplates = [...roomTemplates, ...transitionalRooms];
    const template = allTemplates.find(t => 
      row.id.includes(t.category.toLowerCase().replace(/\s+/g, '-'))
    );

    const matrixRoom: MatrixRoom = {
      id: row.id,
      label: row.label || row.id,
      floor: row.floor,
      category: template?.category,
      index: 1, // Initial rooms are index 1
      walls: false,
      ceiling: false,
      trim: false,
      doors: 0,
      windows: 0,
      cabinets: false,
      selected: false, // Default to unselected
      confidence: 0.5 // Default confidence
    };
    
    // Apply extracted values if available
    if (extractedRooms && extractedRooms[row.id]) {
      const extractedRoom = extractedRooms[row.id];
      console.log('initializeRoomsMatrix - Applying extracted room data:', extractedRoom);
      
      // Override defaults with extracted values
      matrixRoom.walls = extractedRoom.walls;
      matrixRoom.ceiling = extractedRoom.ceiling;
      matrixRoom.trim = extractedRoom.trim;
      matrixRoom.doors = extractedRoom.doors;
      matrixRoom.windows = extractedRoom.windows;
      matrixRoom.cabinets = extractedRoom.cabinets;
      matrixRoom.confidence = extractedRoom.confidence || 0.5;
      matrixRoom.selected = true; // If extracted, mark as selected
      
      console.log('initializeRoomsMatrix - Created matrix room with extracted data:', matrixRoom);
    } else {
      console.log('initializeRoomsMatrix - Created default matrix room:', matrixRoom);
    }
    
    defaultMatrix.push(matrixRoom);
  });
  
  console.log('initializeRoomsMatrix - Final matrix:', defaultMatrix);
  return defaultMatrix;
};
