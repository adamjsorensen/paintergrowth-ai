
import { StandardizedRoom } from "@/types/room-types";

/**
 * Validation utilities for room data
 */

// Validation function for StandardizedRoom objects
export const validateStandardizedRoom = (room: any, source: string): room is StandardizedRoom => {
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

// Validate generated line items
export const validateLineItems = (lineItems: any[]): Array<{
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}> => {
  return lineItems.filter((item, index) => {
    const isValid = item.id && 
                   item.description && 
                   typeof item.quantity === 'number' && 
                   item.quantity > 0 &&
                   typeof item.unitPrice === 'number' && 
                   item.unitPrice >= 0 &&
                   typeof item.total === 'number' && 
                   item.total >= 0;
    
    if (!isValid) {
      console.error(`validateLineItems - Invalid line item at index ${index}:`, item);
    }
    
    return isValid;
  });
};
