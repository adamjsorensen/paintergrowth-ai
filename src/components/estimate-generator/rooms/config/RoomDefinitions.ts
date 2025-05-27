import { MatrixRow, MatrixGroup } from "../types";

// Define room rows organized by type and floor
export const roomRows: MatrixRow[] = [
  // Living Areas - Main Floor
  { id: "living-room", label: "Living Room", group: "living-areas", floor: "main" },
  { id: "family-room", label: "Family Room", group: "living-areas", floor: "main" },
  { id: "dining-room", label: "Dining Room", group: "living-areas", floor: "main" },
  
  // Bedrooms - Upstairs (Master on main, others upstairs)
  { id: "master-bedroom", label: "Master Bedroom", group: "bedrooms", floor: "main" },
  { id: "bedroom", label: "Bedroom", group: "bedrooms", floor: "upstairs" },
  { id: "guest-bedroom", label: "Guest Bedroom", group: "bedrooms", floor: "upstairs" },
  { id: "kids-bedroom", label: "Kids Bedroom", group: "bedrooms", floor: "upstairs" },
  
  // Wet Areas - Mixed floors
  { id: "kitchen", label: "Kitchen", group: "wet-areas", floor: "main" },
  { id: "bathroom", label: "Bathroom", group: "wet-areas", floor: "upstairs" },
  { id: "main-bathroom", label: "Main Bathroom", group: "wet-areas", floor: "main" },
  { id: "ensuite-bathroom", label: "Ensuite Bathroom", group: "wet-areas", floor: "upstairs" },
  { id: "powder-room", label: "Powder Room", group: "wet-areas", floor: "main" },
  { id: "laundry-room", label: "Laundry Room", group: "wet-areas", floor: "basement" },
  
  // Transitional Spaces - Main Floor
  { id: "hallway", label: "Hallway", group: "transitional", floor: "main" },
  { id: "entryway", label: "Entryway", group: "transitional", floor: "main" },
  { id: "foyer", label: "Foyer", group: "transitional", floor: "main" },
  { id: "staircase", label: "Staircase", group: "transitional", floor: "main" },
  
  // Additional Rooms - Mixed floors
  { id: "office", label: "Home Office", group: "additional", floor: "main" },
  { id: "den", label: "Den", group: "additional", floor: "main" },
  { id: "basement", label: "Basement", group: "additional", floor: "basement" },
  { id: "recreation-room", label: "Recreation Room", group: "additional", floor: "basement" },
  { id: "sunroom", label: "Sunroom", group: "additional", floor: "main" },
  { id: "garage", label: "Garage", group: "additional", floor: "main" },
  { id: "attic", label: "Attic", group: "additional", floor: "upstairs" }
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

// Define floor groups
export const floorGroups = [
  { id: "main", label: "Main Floor" },
  { id: "upstairs", label: "Upstairs" },
  { id: "basement", label: "Basement" }
];
