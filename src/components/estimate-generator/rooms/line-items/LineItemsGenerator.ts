
import { StandardizedRoom } from "@/types/room-types";
import { validateStandardizedRoom, validateLineItems } from "../validation/RoomValidationUtils";
import { calculateWallsPrice, calculateCeilingPrice, calculateCabinetPrice } from "../pricing/PricingUtils";

/**
 * Line items generation utilities for creating estimates from room data
 */

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

// Generate line items based on standardized room objects
export const generateLineItemsFromRooms = (roomsMatrix: StandardizedRoom[]): LineItem[] => {
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
  
  const lineItems: LineItem[] = [];
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
  const validatedLineItems = validateLineItems(lineItems);
  
  console.log(`generateLineItemsFromRooms - Valid line items: ${validatedLineItems.length}/${lineItems.length}`);
  
  return validatedLineItems;
};
