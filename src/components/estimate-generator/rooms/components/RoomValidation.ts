
import { StandardizedRoom } from "@/types/room-types";

/**
 * Validation utilities for room matrix data
 */

export const validateMatrixValue = (matrixValue: any): StandardizedRoom[] => {
  if (!Array.isArray(matrixValue)) {
    console.error('RoomsMatrixField - Invalid matrix value (not an array):', matrixValue);
    return [];
  }
  
  const validatedMatrix = matrixValue.filter((room, index) => {
    const isValid = room && 
                   typeof room === 'object' && 
                   room.id && 
                   typeof room.id === 'string' &&
                   room.label && 
                   typeof room.label === 'string' &&
                   typeof room.walls === 'boolean' &&
                   typeof room.ceiling === 'boolean' &&
                   typeof room.trim === 'boolean' &&
                   typeof room.doors === 'number' &&
                   typeof room.windows === 'number' &&
                   typeof room.cabinets === 'boolean';
    
    if (!isValid) {
      console.error(`RoomsMatrixField - Invalid room at index ${index}:`, room);
    } else {
      console.log(`RoomsMatrixField - Valid room at index ${index}:`, room);
    }
    
    return isValid;
  });
  
  console.log(`RoomsMatrixField - Valid rooms: ${validatedMatrix.length}/${matrixValue.length}`);
  return validatedMatrix;
};

export const validateRoomUpdate = (room: StandardizedRoom): boolean => {
  return room.id && 
         room.label && 
         typeof room.walls === 'boolean' &&
         typeof room.ceiling === 'boolean' &&
         typeof room.trim === 'boolean' &&
         typeof room.doors === 'number' &&
         typeof room.windows === 'number' &&
         typeof room.cabinets === 'boolean';
};
