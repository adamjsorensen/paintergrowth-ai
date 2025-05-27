import { MatrixConfig, MatrixGroup, MatrixRow, MatrixColumn } from "@/types/prompt-templates";
import { StandardizedRoom, MatrixRoom } from "@/types/room-types";

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

// Define room rows organized by type
export const roomRows: MatrixRow[] = [
  // Living Areas
  { id: "living-room", label: "Living Room", group: "living-areas" },
  { id: "family-room", label: "Family Room", group: "living-areas" },
  { id: "dining-room", label: "Dining Room", group: "living-areas" },
  
  // Bedrooms
  { id: "master-bedroom", label: "Master Bedroom", group: "bedrooms" },
  { id: "bedroom", label: "Bedroom", group: "bedrooms" },
  { id: "guest-bedroom", label: "Guest Bedroom", group: "bedrooms" },
  { id: "kids-bedroom", label: "Kids Bedroom", group: "bedrooms" },
  
  // Wet Areas
  { id: "kitchen", label: "Kitchen", group: "wet-areas" },
  { id: "bathroom", label: "Bathroom", group: "wet-areas" },
  { id: "main-bathroom", label: "Main Bathroom", group: "wet-areas" },
  { id: "ensuite-bathroom", label: "Ensuite Bathroom", group: "wet-areas" },
  { id: "powder-room", label: "Powder Room", group: "wet-areas" },
  { id: "laundry-room", label: "Laundry Room", group: "wet-areas" },
  
  // Transitional Spaces
  { id: "hallway", label: "Hallway", group: "transitional" },
  { id: "entryway", label: "Entryway", group: "transitional" },
  { id: "foyer", label: "Foyer", group: "transitional" },
  { id: "staircase", label: "Staircase", group: "transitional" },
  
  // Additional Rooms
  { id: "office", label: "Home Office", group: "additional" },
  { id: "den", label: "Den", group: "additional" },
  { id: "basement", label: "Basement", group: "additional" },
  { id: "recreation-room", label: "Recreation Room", group: "additional" },
  { id: "sunroom", label: "Sunroom", group: "additional" },
  { id: "garage", label: "Garage", group: "additional" },
  { id: "attic", label: "Attic", group: "additional" }
];

// Define room groups
export const roomGroups: MatrixGroup[] = [
  { 
    id: "living-areas", 
    label: "Living Areas",
    rowIds: roomRows.filter(row => row.group === "living-areas").map(row => row.id)
  },
  { 
    id: "bedrooms", 
    label: "Bedrooms",
    rowIds: roomRows.filter(row => row.group === "bedrooms").map(row => row.id)
  },
  { 
    id: "wet-areas", 
    label: "Wet Areas",
    rowIds: roomRows.filter(row => row.group === "wet-areas").map(row => row.id)
  },
  { 
    id: "transitional", 
    label: "Transitional Spaces",
    rowIds: roomRows.filter(row => row.group === "transitional").map(row => row.id)
  },
  { 
    id: "additional", 
    label: "Additional Rooms",
    rowIds: roomRows.filter(row => row.group === "additional").map(row => row.id)
  }
];

// Create the full matrix configuration
export const interiorRoomsMatrixConfig: MatrixConfig = {
  type: 'matrix-config',
  columns: surfaceColumns,
  rows: roomRows,
  groups: roomGroups
};

// Helper function to initialize matrix values with standardized room objects
export const initializeRoomsMatrix = (extractedRooms?: Record<string, StandardizedRoom>): MatrixRoom[] => {
  console.log('initializeRoomsMatrix - Input extracted rooms:', extractedRooms);
  
  const defaultMatrix: MatrixRoom[] = [];
  
  // Create an entry for each room with default values
  roomRows.forEach(row => {
    const matrixRoom: MatrixRoom = {
      id: row.id,
      label: row.label || row.id,
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
