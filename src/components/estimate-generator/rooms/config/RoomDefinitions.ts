
import { MatrixRow, MatrixGroup } from "@/types/prompt-templates";

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
