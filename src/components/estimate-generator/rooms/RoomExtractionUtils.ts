
import { identifyRoomFromText, roomNameMapping } from "./InteriorRoomsConfig";
import { StandardizedRoom, ExtractedRoom } from "@/types/room-types";

interface ExtractedField {
  name: string;
  value: any;
  confidence: number;
  formField: string;
}

// Validation function for StandardizedRoom objects
const validateStandardizedRoom = (room: any, source: string): room is StandardizedRoom => {
  console.log(`validateStandardizedRoom - Validating room from ${source}:`, room);
  
  const errors: string[] = [];
  
  if (!room || typeof room !== 'object') {
    errors.push('Room is not an object');
  } else {
    if (!room.id || typeof room.id !== 'string') {
      errors.push('Missing or invalid id');
    }
    if (!room.label || typeof room.label !== 'string') {
      errors.push('Missing or invalid label');
    }
    if (typeof room.walls !== 'boolean') {
      errors.push('Invalid walls property (must be boolean)');
    }
    if (typeof room.ceiling !== 'boolean') {
      errors.push('Invalid ceiling property (must be boolean)');
    }
    if (typeof room.trim !== 'boolean') {
      errors.push('Invalid trim property (must be boolean)');
    }
    if (typeof room.doors !== 'number' || room.doors < 0) {
      errors.push('Invalid doors property (must be non-negative number)');
    }
    if (typeof room.windows !== 'number' || room.windows < 0) {
      errors.push('Invalid windows property (must be non-negative number)');
    }
    if (typeof room.cabinets !== 'boolean') {
      errors.push('Invalid cabinets property (must be boolean)');
    }
    if (room.confidence !== undefined && (typeof room.confidence !== 'number' || room.confidence < 0 || room.confidence > 1)) {
      errors.push('Invalid confidence property (must be number between 0 and 1)');
    }
  }
  
  if (errors.length > 0) {
    console.error(`validateStandardizedRoom - Validation failed for room from ${source}:`, errors);
    return false;
  }
  
  console.log(`validateStandardizedRoom - Room from ${source} is valid`);
  return true;
};

// Process room data from extracted fields and return standardized room objects
export const extractRoomsFromFields = (extractedData: Record<string, any>) => {
  console.log('=== EXTRACT ROOMS FROM FIELDS START ===');
  console.log('extractRoomsFromFields - Input data:', JSON.stringify(extractedData, null, 2));
  
  // Input validation
  if (!extractedData || typeof extractedData !== 'object') {
    console.error('extractRoomsFromFields - Invalid input data:', extractedData);
    return { extractedRooms: {}, extractedRoomsList: [] };
  }
  
  // Initialize rooms object with standardized format
  const extractedRooms: Record<string, StandardizedRoom> = {};
  const extractedRoomsList: string[] = [];
  
  // Get fields and rooms arrays from extractedData
  const fields = Array.isArray(extractedData.fields) ? extractedData.fields : [];
  const rooms = Array.isArray(extractedData.rooms) ? extractedData.rooms : [];
  
  console.log('extractRoomsFromFields - Processing rooms array:', rooms);
  console.log('extractRoomsFromFields - Processing fields array:', fields);
  
  // Process room data from the rooms array (new AI format)
  rooms.forEach((room: ExtractedRoom, index: number) => {
    console.log(`extractRoomsFromFields - Processing room ${index + 1}:`, room);
    
    // Validate extracted room structure
    if (!room || typeof room !== 'object') {
      console.error(`extractRoomsFromFields - Invalid room object at index ${index}:`, room);
      return;
    }
    
    if (!room.room_id || typeof room.room_id !== 'string') {
      console.error(`extractRoomsFromFields - Invalid room_id at index ${index}:`, room.room_id);
      return;
    }
    
    if (!room.surfaces || typeof room.surfaces !== 'object') {
      console.error(`extractRoomsFromFields - Invalid surfaces object at index ${index}:`, room.surfaces);
      return;
    }
    
    const confidence = typeof room.confidence === 'number' ? room.confidence : 0.5;
    
    if (confidence >= 0.25) {
      extractedRoomsList.push(room.room_id);
      
      // Create standardized room object with validation
      const standardizedRoom: StandardizedRoom = {
        id: room.room_id,
        label: room.label || room.room_id,
        walls: Boolean(room.surfaces.walls),
        ceiling: Boolean(room.surfaces.ceiling),
        trim: Boolean(room.surfaces.trim),
        doors: typeof room.surfaces.doors === 'number' ? Math.max(0, room.surfaces.doors) : 0,
        windows: typeof room.surfaces.windows === 'number' ? Math.max(0, room.surfaces.windows) : 0,
        cabinets: Boolean(room.surfaces.cabinets),
        confidence: confidence
      };
      
      // Validate the created room
      if (validateStandardizedRoom(standardizedRoom, 'AI extraction')) {
        extractedRooms[room.room_id] = standardizedRoom;
        console.log(`extractRoomsFromFields - Successfully created standardized room:`, standardizedRoom);
      } else {
        console.error(`extractRoomsFromFields - Failed to create valid standardized room for ${room.room_id}`);
      }
    } else {
      console.log(`extractRoomsFromFields - Skipping room ${room.room_id} due to low confidence: ${confidence}`);
    }
  });
  
  // If no rooms were found in the rooms array, fall back to the old way of finding rooms
  if (extractedRoomsList.length === 0) {
    console.log('extractRoomsFromFields - No rooms found in rooms array, falling back to fields parsing');
    
    // Find general rooms to paint field
    const roomsToPaintField = fields.find((field: ExtractedField) => field.formField === 'roomsToPaint');
    const roomsToPaint = Array.isArray(roomsToPaintField?.value) ? roomsToPaintField.value : [];
    
    console.log('extractRoomsFromFields - Found roomsToPaint field:', roomsToPaintField);
    console.log('extractRoomsFromFields - Rooms to paint:', roomsToPaint);
    
    // Process each room name from the general field
    roomsToPaint.forEach((roomName: string, index: number) => {
      console.log(`extractRoomsFromFields - Processing fallback room ${index + 1}: "${roomName}"`);
      
      if (typeof roomName !== 'string') {
        console.error(`extractRoomsFromFields - Invalid room name at index ${index}:`, roomName);
        return;
      }
      
      const roomId = identifyRoomFromText(roomName);
      console.log(`extractRoomsFromFields - Identified room ID for "${roomName}": ${roomId}`);
      
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
        
        // Validate the created room
        if (validateStandardizedRoom(standardizedRoom, 'fallback parsing')) {
          extractedRooms[roomId] = standardizedRoom;
          console.log(`extractRoomsFromFields - Successfully created fallback room:`, standardizedRoom);
        } else {
          console.error(`extractRoomsFromFields - Failed to create valid fallback room for ${roomId}`);
        }
      } else {
        console.warn(`extractRoomsFromFields - Could not identify room ID for: "${roomName}"`);
      }
    });
    
    // Handle surface information from general surfaces to paint
    const surfacesToPaintField = fields.find((field: ExtractedField) => field.formField === 'surfacesToPaint');
    const surfacesToPaint = Array.isArray(surfacesToPaintField?.value) ? surfacesToPaintField.value : [];
    
    console.log('extractRoomsFromFields - Found surfacesToPaint field:', surfacesToPaintField);
    console.log('extractRoomsFromFields - Surfaces to paint:', surfacesToPaint);
    
    // If we have general surfaces but no specific rooms, apply to all detected rooms
    if (surfacesToPaint.length > 0 && extractedRoomsList.length > 0) {
      console.log('extractRoomsFromFields - Applying general surfaces to rooms:', surfacesToPaint);
      
      // For each room in our list
      extractedRoomsList.forEach(roomId => {
        const room = extractedRooms[roomId];
        if (!room) {
          console.error(`extractRoomsFromFields - Room ${roomId} not found in extractedRooms`);
          return;
        }
        
        console.log(`extractRoomsFromFields - Applying surfaces to room ${roomId}:`, room);
        
        // Apply general surfaces to each room
        surfacesToPaint.forEach((surface: string) => {
          if (typeof surface !== 'string') {
            console.error('extractRoomsFromFields - Invalid surface type:', surface);
            return;
          }
          
          const surfaceLower = surface.toLowerCase();
          
          if (surfaceLower.includes('wall')) {
            room.walls = true;
            console.log(`extractRoomsFromFields - Applied walls to ${roomId}`);
          }
          if (surfaceLower.includes('ceiling')) {
            room.ceiling = true;
            console.log(`extractRoomsFromFields - Applied ceiling to ${roomId}`);
          }
          if (surfaceLower.includes('trim') || surfaceLower.includes('baseboard')) {
            room.trim = true;
            console.log(`extractRoomsFromFields - Applied trim to ${roomId}`);
          }
          if (surfaceLower.includes('door')) {
            room.doors = room.doors + 1;
            console.log(`extractRoomsFromFields - Added door to ${roomId}, total: ${room.doors}`);
          }
          if (surfaceLower.includes('window')) {
            room.windows = room.windows + 1;
            console.log(`extractRoomsFromFields - Added window to ${roomId}, total: ${room.windows}`);
          }
          if (surfaceLower.includes('cabinet')) {
            room.cabinets = true;
            console.log(`extractRoomsFromFields - Applied cabinets to ${roomId}`);
          }
        });
        
        console.log(`extractRoomsFromFields - Final room after surface application:`, room);
        
        // Re-validate room after modifications
        if (!validateStandardizedRoom(room, 'surface application')) {
          console.error(`extractRoomsFromFields - Room ${roomId} became invalid after surface application`);
        }
      });
    } else {
      console.log('extractRoomsFromFields - No surfaces to apply or no rooms to apply them to');
    }
  }
  
  console.log('=== EXTRACT ROOMS FROM FIELDS COMPLETE ===');
  console.log('extractRoomsFromFields - Final extracted rooms:', extractedRooms);
  console.log('extractRoomsFromFields - Final extracted rooms list:', extractedRoomsList);
  console.log('extractRoomsFromFields - Total rooms extracted:', Object.keys(extractedRooms).length);
  
  // Final validation of all extracted rooms
  const validRooms: Record<string, StandardizedRoom> = {};
  const validRoomsList: string[] = [];
  
  Object.entries(extractedRooms).forEach(([roomId, room]) => {
    if (validateStandardizedRoom(room, 'final validation')) {
      validRooms[roomId] = room;
      validRoomsList.push(roomId);
    } else {
      console.error(`extractRoomsFromFields - Removing invalid room from final results: ${roomId}`);
    }
  });
  
  console.log('extractRoomsFromFields - Final valid rooms:', validRooms);
  console.log('extractRoomsFromFields - Final valid rooms list:', validRoomsList);
  
  return { extractedRooms: validRooms, extractedRoomsList: validRoomsList };
};

// Generate line items based on standardized room objects
export const generateLineItemsFromRooms = (roomsMatrix: StandardizedRoom[]) => {
  console.log('=== GENERATE LINE ITEMS FROM ROOMS START ===');
  console.log('generateLineItemsFromRooms - Input rooms matrix:', roomsMatrix);
  console.log('generateLineItemsFromRooms - Input type check:', Array.isArray(roomsMatrix) ? 'Array' : typeof roomsMatrix);
  
  // Validate input
  if (!Array.isArray(roomsMatrix)) {
    console.error('generateLineItemsFromRooms - Invalid input: roomsMatrix is not an array', roomsMatrix);
    return [];
  }
  
  // Validate all rooms in the matrix
  const validRooms: StandardizedRoom[] = [];
  roomsMatrix.forEach((room, index) => {
    console.log(`generateLineItemsFromRooms - Validating room ${index + 1}:`, room);
    
    if (validateStandardizedRoom(room, `matrix input ${index + 1}`)) {
      validRooms.push(room);
    } else {
      console.error(`generateLineItemsFromRooms - Skipping invalid room at index ${index}`);
    }
  });
  
  console.log(`generateLineItemsFromRooms - Valid rooms after validation: ${validRooms.length}/${roomsMatrix.length}`);
  
  const lineItems: Array<{
    id: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    total: number;
  }> = [];
  
  let itemId = 1;
  
  // Process each valid room
  validRooms.forEach((room, index) => {
    console.log(`=== Processing Room ${index + 1}: ${room.label} ===`);
    console.log(`generateLineItemsFromRooms - Room details:`, room);
    
    // Ensure we have required properties with fallbacks and validation
    const roomId = room.id || `room-${index}`;
    const roomLabel = room.label || roomId;
    
    if (!roomLabel || typeof roomLabel !== 'string') {
      console.error(`generateLineItemsFromRooms - Invalid room label for room ${index}:`, roomLabel);
      return;
    }
    
    // Calculate if this room has any surfaces selected
    const hasWalls = Boolean(room.walls);
    const hasCeiling = Boolean(room.ceiling);
    const hasTrim = Boolean(room.trim);
    const doorCount = typeof room.doors === 'number' && room.doors >= 0 ? room.doors : 0;
    const windowCount = typeof room.windows === 'number' && room.windows >= 0 ? room.windows : 0;
    const hasCabinets = Boolean(room.cabinets);
    
    console.log(`generateLineItemsFromRooms - Room ${roomLabel} surface analysis:`, {
      hasWalls,
      hasCeiling,
      hasTrim,
      doorCount,
      windowCount,
      hasCabinets
    });
    
    // Skip rooms with no surfaces
    if (!hasWalls && !hasCeiling && !hasTrim && doorCount === 0 && windowCount === 0 && !hasCabinets) {
      console.log(`generateLineItemsFromRooms - Skipping room with no surfaces: ${roomLabel}`);
      return;
    }
    
    // Add line items for each surface type
    if (hasWalls) {
      const wallsPrice = calculateWallsPrice(roomLabel);
      const wallsItem = {
        id: `item-${itemId++}`,
        description: `Paint ${roomLabel} - Walls`,
        quantity: 1,
        unit: 'room',
        unitPrice: wallsPrice,
        total: wallsPrice
      };
      lineItems.push(wallsItem);
      console.log(`generateLineItemsFromRooms - Added walls item:`, wallsItem);
    }
    
    if (hasCeiling) {
      const ceilingPrice = calculateCeilingPrice(roomLabel);
      const ceilingItem = {
        id: `item-${itemId++}`,
        description: `Paint ${roomLabel} - Ceiling`,
        quantity: 1,
        unit: 'room',
        unitPrice: ceilingPrice,
        total: ceilingPrice
      };
      lineItems.push(ceilingItem);
      console.log(`generateLineItemsFromRooms - Added ceiling item:`, ceilingItem);
    }
    
    if (hasTrim) {
      const trimItem = {
        id: `item-${itemId++}`,
        description: `Paint ${roomLabel} - Trim/Baseboards`,
        quantity: 1,
        unit: 'room',
        unitPrice: 250,
        total: 250
      };
      lineItems.push(trimItem);
      console.log(`generateLineItemsFromRooms - Added trim item:`, trimItem);
    }
    
    if (doorCount > 0) {
      const doorsItem = {
        id: `item-${itemId++}`,
        description: `Paint ${roomLabel} - Doors`,
        quantity: doorCount,
        unit: 'door',
        unitPrice: 100,
        total: 100 * doorCount
      };
      lineItems.push(doorsItem);
      console.log(`generateLineItemsFromRooms - Added doors item:`, doorsItem);
    }
    
    if (windowCount > 0) {
      const windowsItem = {
        id: `item-${itemId++}`,
        description: `Paint ${roomLabel} - Window Trim`,
        quantity: windowCount,
        unit: 'window',
        unitPrice: 75,
        total: 75 * windowCount
      };
      lineItems.push(windowsItem);
      console.log(`generateLineItemsFromRooms - Added windows item:`, windowsItem);
    }
    
    if (hasCabinets) {
      const cabinetPrice = calculateCabinetPrice(roomLabel);
      const cabinetsItem = {
        id: `item-${itemId++}`,
        description: `Paint ${roomLabel} - Cabinets`,
        quantity: 1,
        unit: 'set',
        unitPrice: cabinetPrice,
        total: cabinetPrice
      };
      lineItems.push(cabinetsItem);
      console.log(`generateLineItemsFromRooms - Added cabinets item:`, cabinetsItem);
    }
    
    console.log(`=== Completed Room ${index + 1}: ${room.label} ===`);
  });
  
  // Add general items only if we have room-specific items
  if (lineItems.length > 0) {
    const prepItem = {
      id: `item-${itemId++}`,
      description: 'Surface Preparation',
      quantity: 1,
      unit: 'project',
      unitPrice: 350,
      total: 350
    };
    lineItems.push(prepItem);
    console.log('generateLineItemsFromRooms - Added surface preparation item:', prepItem);
    
    const materialsItem = {
      id: `item-${itemId++}`,
      description: 'Premium Paint and Materials',
      quantity: 1,
      unit: 'project',
      unitPrice: 450,
      total: 450
    };
    lineItems.push(materialsItem);
    console.log('generateLineItemsFromRooms - Added materials item:', materialsItem);
  } else {
    console.log('generateLineItemsFromRooms - No line items generated from rooms, skipping general items');
  }
  
  console.log('=== GENERATE LINE ITEMS FROM ROOMS COMPLETE ===');
  console.log('generateLineItemsFromRooms - Final line items:', lineItems);
  console.log('generateLineItemsFromRooms - Total line items generated:', lineItems.length);
  
  // Validate all generated line items
  const validatedLineItems = lineItems.filter((item, index) => {
    const isValid = item.id && 
                   item.description && 
                   typeof item.quantity === 'number' && 
                   item.quantity > 0 &&
                   typeof item.unitPrice === 'number' && 
                   item.unitPrice >= 0 &&
                   typeof item.total === 'number' && 
                   item.total >= 0;
    
    if (!isValid) {
      console.error(`generateLineItemsFromRooms - Invalid line item at index ${index}:`, item);
    }
    
    return isValid;
  });
  
  console.log(`generateLineItemsFromRooms - Valid line items: ${validatedLineItems.length}/${lineItems.length}`);
  
  return validatedLineItems;
};

// Helper functions to calculate prices based on room label (consistent naming)
const calculateWallsPrice = (roomLabel: string): number => {
  console.log(`calculateWallsPrice - Calculating for room: "${roomLabel}"`);
  
  if (!roomLabel || typeof roomLabel !== 'string') {
    console.warn('calculateWallsPrice - Invalid roomLabel:', roomLabel);
    return 300; // Default price
  }
  
  const roomLower = roomLabel.toLowerCase();
  let price = 300; // Default
  
  if (roomLower.includes('kitchen') || roomLower.includes('bathroom')) {
    price = 400; // More expensive for wet areas
    console.log(`calculateWallsPrice - Wet area pricing applied: $${price}`);
  } else if (roomLower.includes('master') || roomLower.includes('living')) {
    price = 350; // Standard large rooms
    console.log(`calculateWallsPrice - Large room pricing applied: $${price}`);
  } else {
    console.log(`calculateWallsPrice - Standard room pricing applied: $${price}`);
  }
  
  return price;
};

const calculateCeilingPrice = (roomLabel: string): number => {
  console.log(`calculateCeilingPrice - Calculating for room: "${roomLabel}"`);
  
  if (!roomLabel || typeof roomLabel !== 'string') {
    console.warn('calculateCeilingPrice - Invalid roomLabel:', roomLabel);
    return 180; // Default price
  }
  
  const roomLower = roomLabel.toLowerCase();
  let price = 180; // Default
  
  if (roomLower.includes('kitchen') || roomLower.includes('bathroom')) {
    price = 250; // More expensive for wet areas
    console.log(`calculateCeilingPrice - Wet area pricing applied: $${price}`);
  } else if (roomLower.includes('master') || roomLower.includes('living')) {
    price = 200; // Standard large rooms
    console.log(`calculateCeilingPrice - Large room pricing applied: $${price}`);
  } else {
    console.log(`calculateCeilingPrice - Standard room pricing applied: $${price}`);
  }
  
  return price;
};

const calculateCabinetPrice = (roomLabel: string): number => {
  console.log(`calculateCabinetPrice - Calculating for room: "${roomLabel}"`);
  
  if (!roomLabel || typeof roomLabel !== 'string') {
    console.warn('calculateCabinetPrice - Invalid roomLabel:', roomLabel);
    return 500; // Default price
  }
  
  const roomLower = roomLabel.toLowerCase();
  let price = 500; // Default
  
  if (roomLower.includes('kitchen')) {
    price = 1800; // Kitchen cabinets are most expensive
    console.log(`calculateCabinetPrice - Kitchen cabinet pricing applied: $${price}`);
  } else if (roomLower.includes('bathroom')) {
    price = 700; // Bathroom vanities
    console.log(`calculateCabinetPrice - Bathroom cabinet pricing applied: $${price}`);
  } else {
    console.log(`calculateCabinetPrice - Standard cabinet pricing applied: $${price}`);
  }
  
  return price;
};
