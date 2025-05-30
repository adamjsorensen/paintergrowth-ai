
import { RoomTemplate, MatrixGroup } from "../types";

// Define room templates organized by floor
export const roomTemplates: RoomTemplate[] = [
  // Main Floor
  { floor: 'main', category: 'Kitchen', defaultLabel: 'Kitchen', aliases: ['kitchen', 'cooking area'] },
  { floor: 'main', category: 'Dining Room', defaultLabel: 'Dining Room', aliases: ['dining room', 'eating area'] },
  { floor: 'main', category: 'Living Room', defaultLabel: 'Living Room', aliases: ['living room', 'main room', 'front room'] },
  { floor: 'main', category: 'Powder Room', defaultLabel: 'Powder Room', aliases: ['powder room', 'half bath', 'guest powder room'] },
  { floor: 'main', category: 'Laundry Room', defaultLabel: 'Laundry Room', aliases: ['laundry room', 'utility room'] },
  
  // Upper Floor
  { floor: 'upper', category: 'Bedroom', defaultLabel: 'Bedroom', aliases: ['bedroom', 'master bedroom', 'primary bedroom', 'guest bedroom', 'kids bedroom'] },
  { floor: 'upper', category: 'Bathroom', defaultLabel: 'Bathroom', aliases: ['bathroom', 'full bathroom', 'ensuite', 'master bath'] },
  
  // Basement
  { floor: 'basement', category: 'Recreation Room', defaultLabel: 'Recreation Room', aliases: ['rec room', 'recreation', 'game room', 'family room'] },
  
  // Additional common room types (can be added to any floor)
  { floor: 'main', category: 'Office', defaultLabel: 'Office', aliases: ['office', 'study', 'home office'] },
  { floor: 'main', category: 'Den', defaultLabel: 'Den', aliases: ['den'] },
  { floor: 'basement', category: 'Basement', defaultLabel: 'Basement', aliases: ['basement', 'lower level'] },
  { floor: 'main', category: 'Garage', defaultLabel: 'Garage', aliases: ['garage', 'car garage'] },
];

// Transitional spaces remain as a separate category
export const transitionalRooms: RoomTemplate[] = [
  { floor: 'main', category: 'Hallway', defaultLabel: 'Hallway', aliases: ['hallway', 'corridor', 'upstairs hallway', 'main hallway'] },
  { floor: 'main', category: 'Entryway', defaultLabel: 'Entryway', aliases: ['entryway', 'entrance'] },
  { floor: 'main', category: 'Foyer', defaultLabel: 'Foyer', aliases: ['foyer'] },
  { floor: 'main', category: 'Staircase', defaultLabel: 'Staircase', aliases: ['staircase', 'stairs', 'stairway', 'stairwell'] },
];

// Define floor-based groups
export const floorGroups: MatrixGroup[] = [
  { 
    id: "main-floor", 
    label: "Main Floor",
    rowIds: [] // Will be populated dynamically
  },
  { 
    id: "upper-floor", 
    label: "Upper Floor",
    rowIds: [] // Will be populated dynamically
  },
  { 
    id: "basement", 
    label: "Basement",
    rowIds: [] // Will be populated dynamically
  },
  { 
    id: "transitional", 
    label: "Transitional Spaces",
    rowIds: [] // Will be populated dynamically
  }
];

// Utility functions for working with templates
export const getTemplatesByFloor = (floor: 'main' | 'upper' | 'basement') => {
  return roomTemplates.filter(template => template.floor === floor);
};

export const getAllCategories = () => {
  const categories = new Set<string>();
  [...roomTemplates, ...transitionalRooms].forEach(template => {
    categories.add(template.category);
  });
  return Array.from(categories);
};

export const createRoomInstance = (
  template: RoomTemplate, 
  index: number = 1,
  customLabel?: string
): { id: string; label: string; floor: string; category: string; index: number } => {
  const baseId = template.category.toLowerCase().replace(/\s+/g, '-');
  const floorPrefix = template.floor;
  const id = index === 1 ? `${floorPrefix}-${baseId}` : `${floorPrefix}-${baseId}-${index}`;
  
  const label = customLabel || (index === 1 ? template.defaultLabel : `${template.defaultLabel} ${index}`);
  
  return {
    id,
    label,
    floor: template.floor,
    category: template.category,
    index
  };
};
