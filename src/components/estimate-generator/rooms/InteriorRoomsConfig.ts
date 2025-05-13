
import { MatrixConfig, MatrixGroup, MatrixRow, MatrixColumn } from "@/types/prompt-templates";

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
  columns: surfaceColumns,
  rows: roomRows,
  groups: roomGroups
};

// Helper function to initialize matrix values
export const initializeRoomsMatrix = (extractedRooms?: Record<string, any>) => {
  const defaultMatrix: any[] = [];
  
  // Create an entry for each room with default values
  roomRows.forEach(room => {
    const roomValues: Record<string, any> = {
      id: room.id,
      name: room.label
    };
    
    // Initialize all surface types to default values
    surfaceColumns.forEach(column => {
      if (column.type === "checkbox") {
        roomValues[column.id] = false;
      } else if (column.type === "number") {
        roomValues[column.id] = 0;
      }
    });
    
    // Apply extracted values if available
    if (extractedRooms && extractedRooms[room.id]) {
      const extractedRoom = extractedRooms[room.id];
      
      // Override defaults with extracted values
      Object.keys(extractedRoom).forEach(key => {
        if (roomValues.hasOwnProperty(key)) {
          roomValues[key] = extractedRoom[key];
        }
      });
    }
    
    defaultMatrix.push(roomValues);
  });
  
  return defaultMatrix;
};

// Map common room name variations to our room IDs
export const roomNameMapping: Record<string, string> = {
  // Living areas
  "living": "living-room",
  "lounge": "living-room",
  "sitting room": "living-room",
  "family": "family-room",
  "den": "den",
  "great room": "family-room",
  "dining": "dining-room",
  
  // Bedrooms
  "master": "master-bedroom",
  "primary bedroom": "master-bedroom",
  "main bedroom": "master-bedroom",
  "bedroom": "bedroom",
  "guest": "guest-bedroom",
  "kids": "kids-bedroom",
  "children": "kids-bedroom",
  "child's room": "kids-bedroom",
  "childs room": "kids-bedroom",
  
  // Wet areas
  "kitchen": "kitchen",
  "bathroom": "bathroom",
  "bath": "bathroom",
  "main bathroom": "main-bathroom",
  "master bath": "ensuite-bathroom",
  "ensuite": "ensuite-bathroom",
  "en-suite": "ensuite-bathroom",
  "powder": "powder-room",
  "half bath": "powder-room",
  "laundry": "laundry-room",
  "utility": "laundry-room",
  "mud room": "laundry-room",
  
  // Transitional spaces
  "hall": "hallway",
  "hallway": "hallway",
  "corridor": "hallway",
  "entry": "entryway",
  "entryway": "entryway",
  "foyer": "foyer",
  "stairs": "staircase",
  "stairway": "staircase",
  "stairwell": "staircase",
  
  // Additional rooms
  "office": "office",
  "home office": "office",
  "study": "office",
  "basement": "basement",
  "lower level": "basement",
  "rec room": "recreation-room",
  "recreation": "recreation-room",
  "game room": "recreation-room",
  "sunroom": "sunroom",
  "sun porch": "sunroom",
  "garage": "garage",
  "attic": "attic",
  "loft": "attic"
};

// Helper function to match room names from transcript
export const identifyRoomFromText = (text: string) => {
  text = text.toLowerCase();
  
  for (const [key, value] of Object.entries(roomNameMapping)) {
    if (text.includes(key.toLowerCase())) {
      return value;
    }
  }
  
  return null;
};
