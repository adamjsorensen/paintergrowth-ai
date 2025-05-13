
import { identifyRoomFromText, roomNameMapping } from "./InteriorRoomsConfig";

interface ExtractedField {
  name: string;
  value: any;
  confidence: number;
  formField: string;
}

// Process room data from extracted fields
export const extractRoomsFromFields = (fields: ExtractedField[]) => {
  // Initialize rooms object
  const extractedRooms: Record<string, any> = {};
  const extractedRoomsList: string[] = [];
  
  // Find general rooms to paint field
  const roomsToPaintField = fields.find(field => field.formField === 'roomsToPaint');
  const roomsToPaint = roomsToPaintField?.value || [];
  
  // Process each room name from the general field
  if (Array.isArray(roomsToPaint)) {
    roomsToPaint.forEach((roomName: string) => {
      const roomId = identifyRoomFromText(roomName);
      if (roomId) {
        extractedRoomsList.push(roomId);
        
        // Initialize room with default values if not already present
        if (!extractedRooms[roomId]) {
          extractedRooms[roomId] = {
            walls: false,
            ceiling: false,
            trim: false,
            doors: 0,
            windows: 0,
            cabinets: false
          };
        }
      }
    });
  }
  
  // Process specific room fields for detailed surface information
  fields.forEach(field => {
    // Check if the field corresponds to a room
    const roomKey = Object.keys(roomNameMapping).find(key => 
      field.formField.toLowerCase() === key.toLowerCase() ||
      field.formField.toLowerCase() === roomNameMapping[key].toLowerCase() ||
      field.formField.toLowerCase().replace(/[^a-z0-9]/g, '') === roomNameMapping[key].toLowerCase().replace(/[^a-z0-9]/g, '')
    );
    
    if (roomKey) {
      const roomId = roomNameMapping[roomKey];
      
      // Add to the extracted rooms list if not already there
      if (!extractedRoomsList.includes(roomId)) {
        extractedRoomsList.push(roomId);
      }
      
      // Get room details
      const roomValue = field.value;
      
      // Add room with its details to extracted rooms
      if (typeof roomValue === 'object' && roomValue !== null) {
        extractedRooms[roomId] = {
          walls: Boolean(roomValue.walls),
          ceiling: Boolean(roomValue.ceiling),
          trim: Boolean(roomValue.trim),
          doors: typeof roomValue.doors === 'number' ? roomValue.doors : Boolean(roomValue.doors) ? 1 : 0,
          windows: typeof roomValue.windows === 'number' ? roomValue.windows : Boolean(roomValue.windows) ? 1 : 0,
          cabinets: Boolean(roomValue.cabinets)
        };
      }
    }
  });
  
  // Handle surface information from general surfaces to paint
  const surfacesToPaintField = fields.find(field => field.formField === 'surfacesToPaint');
  const surfacesToPaint = surfacesToPaintField?.value || [];
  
  // If we have general surfaces but no specific rooms, apply to all detected rooms
  if (Array.isArray(surfacesToPaint) && surfacesToPaint.length > 0 && extractedRoomsList.length > 0) {
    // For each room in our list
    extractedRoomsList.forEach(roomId => {
      if (!extractedRooms[roomId]) {
        extractedRooms[roomId] = {
          walls: false,
          ceiling: false,
          trim: false,
          doors: 0,
          windows: 0,
          cabinets: false
        };
      }
      
      // Apply general surfaces to each room
      surfacesToPaint.forEach((surface: string) => {
        const surfaceLower = surface.toLowerCase();
        
        if (surfaceLower.includes('wall')) {
          extractedRooms[roomId].walls = true;
        }
        if (surfaceLower.includes('ceiling')) {
          extractedRooms[roomId].ceiling = true;
        }
        if (surfaceLower.includes('trim') || surfaceLower.includes('baseboard')) {
          extractedRooms[roomId].trim = true;
        }
        if (surfaceLower.includes('door')) {
          extractedRooms[roomId].doors = typeof extractedRooms[roomId].doors === 'number' ? extractedRooms[roomId].doors + 1 : 1;
        }
        if (surfaceLower.includes('window')) {
          extractedRooms[roomId].windows = typeof extractedRooms[roomId].windows === 'number' ? extractedRooms[roomId].windows + 1 : 1;
        }
        if (surfaceLower.includes('cabinet')) {
          extractedRooms[roomId].cabinets = true;
        }
      });
    });
  }
  
  return { extractedRooms, extractedRoomsList };
};

// Generate line items based on extracted rooms
export const generateLineItemsFromRooms = (roomsMatrix: any[]) => {
  const lineItems: Array<{
    id: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    total: number;
  }> = [];
  
  let itemId = 1;
  
  // Process each room
  roomsMatrix.forEach(room => {
    // Calculate if this room has any surfaces selected
    const hasWalls = Boolean(room.walls);
    const hasCeiling = Boolean(room.ceiling);
    const hasTrim = Boolean(room.trim);
    const doorCount = typeof room.doors === 'number' ? room.doors : 0;
    const windowCount = typeof room.windows === 'number' ? room.windows : 0;
    const hasCabinets = Boolean(room.cabinets);
    
    // Skip rooms with no surfaces
    if (!hasWalls && !hasCeiling && !hasTrim && doorCount === 0 && windowCount === 0 && !hasCabinets) {
      return;
    }
    
    // Add line items for each surface type
    if (hasWalls) {
      lineItems.push({
        id: `item-${itemId++}`,
        description: `Paint ${room.name} - Walls`,
        quantity: 1,
        unit: 'room',
        unitPrice: calculateWallsPrice(room.name),
        total: calculateWallsPrice(room.name)
      });
    }
    
    if (hasCeiling) {
      lineItems.push({
        id: `item-${itemId++}`,
        description: `Paint ${room.name} - Ceiling`,
        quantity: 1,
        unit: 'room',
        unitPrice: calculateCeilingPrice(room.name),
        total: calculateCeilingPrice(room.name)
      });
    }
    
    if (hasTrim) {
      lineItems.push({
        id: `item-${itemId++}`,
        description: `Paint ${room.name} - Trim/Baseboards`,
        quantity: 1,
        unit: 'room',
        unitPrice: 250,
        total: 250
      });
    }
    
    if (doorCount > 0) {
      lineItems.push({
        id: `item-${itemId++}`,
        description: `Paint ${room.name} - Doors`,
        quantity: doorCount,
        unit: 'door',
        unitPrice: 100,
        total: 100 * doorCount
      });
    }
    
    if (windowCount > 0) {
      lineItems.push({
        id: `item-${itemId++}`,
        description: `Paint ${room.name} - Window Trim`,
        quantity: windowCount,
        unit: 'window',
        unitPrice: 75,
        total: 75 * windowCount
      });
    }
    
    if (hasCabinets) {
      lineItems.push({
        id: `item-${itemId++}`,
        description: `Paint ${room.name} - Cabinets`,
        quantity: 1,
        unit: 'set',
        unitPrice: calculateCabinetPrice(room.name),
        total: calculateCabinetPrice(room.name)
      });
    }
  });
  
  // Add general items
  if (lineItems.length > 0) {
    lineItems.push({
      id: `item-${itemId++}`,
      description: 'Surface Preparation',
      quantity: 1,
      unit: 'project',
      unitPrice: 350,
      total: 350
    });
    
    lineItems.push({
      id: `item-${itemId++}`,
      description: 'Premium Paint and Materials',
      quantity: 1,
      unit: 'project',
      unitPrice: 450,
      total: 450
    });
  }
  
  return lineItems;
};

// Helper functions to calculate prices based on room type
const calculateWallsPrice = (roomName: string): number => {
  const roomLower = roomName.toLowerCase();
  
  if (roomLower.includes('kitchen') || roomLower.includes('bathroom')) {
    return 400; // More expensive for wet areas
  } else if (roomLower.includes('master') || roomLower.includes('living')) {
    return 350; // Standard large rooms
  } else {
    return 300; // Standard rooms
  }
};

const calculateCeilingPrice = (roomName: string): number => {
  const roomLower = roomName.toLowerCase();
  
  if (roomLower.includes('kitchen') || roomLower.includes('bathroom')) {
    return 250; // More expensive for wet areas
  } else if (roomLower.includes('master') || roomLower.includes('living')) {
    return 200; // Standard large rooms
  } else {
    return 180; // Standard rooms
  }
};

const calculateCabinetPrice = (roomName: string): number => {
  const roomLower = roomName.toLowerCase();
  
  if (roomLower.includes('kitchen')) {
    return 1800; // Kitchen cabinets are most expensive
  } else if (roomLower.includes('bathroom')) {
    return 700; // Bathroom vanities
  } else {
    return 500; // Other cabinets
  }
};
