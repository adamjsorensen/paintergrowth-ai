
import { identifyRoomFromText, roomNameMapping } from "./InteriorRoomsConfig";
import { StandardizedRoom, ExtractedRoom } from "@/types/room-types";

interface ExtractedField {
  name: string;
  value: any;
  confidence: number;
  formField: string;
}

// Process room data from extracted fields and return standardized room objects
export const extractRoomsFromFields = (extractedData: Record<string, any>) => {
  console.log('extractRoomsFromFields - Input data:', JSON.stringify(extractedData, null, 2));
  
  // Initialize rooms object with standardized format
  const extractedRooms: Record<string, StandardizedRoom> = {};
  const extractedRoomsList: string[] = [];
  
  // Get fields and rooms arrays from extractedData
  const fields = extractedData.fields || [];
  const rooms = extractedData.rooms || [];
  
  console.log('extractRoomsFromFields - Processing rooms array:', rooms);
  
  // Process room data from the rooms array (new AI format)
  rooms.forEach((room: ExtractedRoom) => {
    console.log('extractRoomsFromFields - Processing room:', room);
    
    if (room.room_id && room.confidence >= 0.25) {
      extractedRoomsList.push(room.room_id);
      
      // Create standardized room object
      const standardizedRoom: StandardizedRoom = {
        id: room.room_id,
        label: room.label || room.room_id,
        walls: Boolean(room.surfaces.walls),
        ceiling: Boolean(room.surfaces.ceiling),
        trim: Boolean(room.surfaces.trim),
        doors: typeof room.surfaces.doors === 'number' ? room.surfaces.doors : 0,
        windows: typeof room.surfaces.windows === 'number' ? room.surfaces.windows : 0,
        cabinets: Boolean(room.surfaces.cabinets),
        confidence: room.confidence
      };
      
      extractedRooms[room.room_id] = standardizedRoom;
      console.log('extractRoomsFromFields - Created standardized room:', standardizedRoom);
    }
  });
  
  // If no rooms were found in the rooms array, fall back to the old way of finding rooms
  if (extractedRoomsList.length === 0) {
    console.log('extractRoomsFromFields - No rooms found in rooms array, falling back to fields parsing');
    
    // Find general rooms to paint field
    const roomsToPaintField = fields.find((field: ExtractedField) => field.formField === 'roomsToPaint');
    const roomsToPaint = roomsToPaintField?.value || [];
    
    // Process each room name from the general field
    if (Array.isArray(roomsToPaint)) {
      roomsToPaint.forEach((roomName: string) => {
        const roomId = identifyRoomFromText(roomName);
        if (roomId) {
          extractedRoomsList.push(roomId);
          
          // Create standardized room object with defaults
          const standardizedRoom: StandardizedRoom = {
            id: roomId,
            label: roomName,
            walls: false,
            ceiling: false,
            trim: false,
            doors: 0,
            windows: 0,
            cabinets: false,
            confidence: roomsToPaintField?.confidence || 0.5
          };
          
          extractedRooms[roomId] = standardizedRoom;
          console.log('extractRoomsFromFields - Created fallback room:', standardizedRoom);
        }
      });
    }
    
    // Handle surface information from general surfaces to paint
    const surfacesToPaintField = fields.find((field: ExtractedField) => field.formField === 'surfacesToPaint');
    const surfacesToPaint = surfacesToPaintField?.value || [];
    
    // If we have general surfaces but no specific rooms, apply to all detected rooms
    if (Array.isArray(surfacesToPaint) && surfacesToPaint.length > 0 && extractedRoomsList.length > 0) {
      console.log('extractRoomsFromFields - Applying general surfaces to rooms:', surfacesToPaint);
      
      // For each room in our list
      extractedRoomsList.forEach(roomId => {
        const room = extractedRooms[roomId];
        if (!room) return;
        
        // Apply general surfaces to each room
        surfacesToPaint.forEach((surface: string) => {
          const surfaceLower = surface.toLowerCase();
          
          if (surfaceLower.includes('wall')) {
            room.walls = true;
          }
          if (surfaceLower.includes('ceiling')) {
            room.ceiling = true;
          }
          if (surfaceLower.includes('trim') || surfaceLower.includes('baseboard')) {
            room.trim = true;
          }
          if (surfaceLower.includes('door')) {
            room.doors = room.doors + 1;
          }
          if (surfaceLower.includes('window')) {
            room.windows = room.windows + 1;
          }
          if (surfaceLower.includes('cabinet')) {
            room.cabinets = true;
          }
        });
        
        console.log('extractRoomsFromFields - Updated room with surfaces:', room);
      });
    }
  }
  
  console.log('extractRoomsFromFields - Final extracted rooms:', extractedRooms);
  console.log('extractRoomsFromFields - Final extracted rooms list:', extractedRoomsList);
  
  return { extractedRooms, extractedRoomsList };
};

// Generate line items based on standardized room objects
export const generateLineItemsFromRooms = (roomsMatrix: StandardizedRoom[]) => {
  console.log('generateLineItemsFromRooms - Input rooms matrix:', roomsMatrix);
  
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
    console.log('generateLineItemsFromRooms - Processing room:', room);
    
    // Calculate if this room has any surfaces selected
    const hasWalls = Boolean(room.walls);
    const hasCeiling = Boolean(room.ceiling);
    const hasTrim = Boolean(room.trim);
    const doorCount = typeof room.doors === 'number' ? room.doors : 0;
    const windowCount = typeof room.windows === 'number' ? room.windows : 0;
    const hasCabinets = Boolean(room.cabinets);
    
    // Skip rooms with no surfaces
    if (!hasWalls && !hasCeiling && !hasTrim && doorCount === 0 && windowCount === 0 && !hasCabinets) {
      console.log('generateLineItemsFromRooms - Skipping room with no surfaces:', room.label);
      return;
    }
    
    // Add line items for each surface type
    if (hasWalls) {
      const wallsPrice = calculateWallsPrice(room.label);
      lineItems.push({
        id: `item-${itemId++}`,
        description: `Paint ${room.label} - Walls`,
        quantity: 1,
        unit: 'room',
        unitPrice: wallsPrice,
        total: wallsPrice
      });
      console.log(`generateLineItemsFromRooms - Added walls item for ${room.label}: $${wallsPrice}`);
    }
    
    if (hasCeiling) {
      const ceilingPrice = calculateCeilingPrice(room.label);
      lineItems.push({
        id: `item-${itemId++}`,
        description: `Paint ${room.label} - Ceiling`,
        quantity: 1,
        unit: 'room',
        unitPrice: ceilingPrice,
        total: ceilingPrice
      });
      console.log(`generateLineItemsFromRooms - Added ceiling item for ${room.label}: $${ceilingPrice}`);
    }
    
    if (hasTrim) {
      lineItems.push({
        id: `item-${itemId++}`,
        description: `Paint ${room.label} - Trim/Baseboards`,
        quantity: 1,
        unit: 'room',
        unitPrice: 250,
        total: 250
      });
      console.log(`generateLineItemsFromRooms - Added trim item for ${room.label}: $250`);
    }
    
    if (doorCount > 0) {
      lineItems.push({
        id: `item-${itemId++}`,
        description: `Paint ${room.label} - Doors`,
        quantity: doorCount,
        unit: 'door',
        unitPrice: 100,
        total: 100 * doorCount
      });
      console.log(`generateLineItemsFromRooms - Added doors item for ${room.label}: ${doorCount} doors @ $100 = $${100 * doorCount}`);
    }
    
    if (windowCount > 0) {
      lineItems.push({
        id: `item-${itemId++}`,
        description: `Paint ${room.label} - Window Trim`,
        quantity: windowCount,
        unit: 'window',
        unitPrice: 75,
        total: 75 * windowCount
      });
      console.log(`generateLineItemsFromRooms - Added windows item for ${room.label}: ${windowCount} windows @ $75 = $${75 * windowCount}`);
    }
    
    if (hasCabinets) {
      const cabinetPrice = calculateCabinetPrice(room.label);
      lineItems.push({
        id: `item-${itemId++}`,
        description: `Paint ${room.label} - Cabinets`,
        quantity: 1,
        unit: 'set',
        unitPrice: cabinetPrice,
        total: cabinetPrice
      });
      console.log(`generateLineItemsFromRooms - Added cabinets item for ${room.label}: $${cabinetPrice}`);
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
    
    console.log('generateLineItemsFromRooms - Added general preparation and materials items');
  }
  
  console.log('generateLineItemsFromRooms - Final line items:', lineItems);
  return lineItems;
};

// Helper functions to calculate prices based on room type (using label instead of name)
const calculateWallsPrice = (roomLabel: string): number => {
  const roomLower = roomLabel.toLowerCase();
  
  if (roomLower.includes('kitchen') || roomLower.includes('bathroom')) {
    return 400; // More expensive for wet areas
  } else if (roomLower.includes('master') || roomLower.includes('living')) {
    return 350; // Standard large rooms
  } else {
    return 300; // Standard rooms
  }
};

const calculateCeilingPrice = (roomLabel: string): number => {
  const roomLower = roomLabel.toLowerCase();
  
  if (roomLower.includes('kitchen') || roomLower.includes('bathroom')) {
    return 250; // More expensive for wet areas
  } else if (roomLower.includes('master') || roomLower.includes('living')) {
    return 200; // Standard large rooms
  } else {
    return 180; // Standard rooms
  }
};

const calculateCabinetPrice = (roomLabel: string): number => {
  const roomLower = roomLabel.toLowerCase();
  
  if (roomLower.includes('kitchen')) {
    return 1800; // Kitchen cabinets are most expensive
  } else if (roomLower.includes('bathroom')) {
    return 700; // Bathroom vanities
  } else {
    return 500; // Other cabinets
  }
};
