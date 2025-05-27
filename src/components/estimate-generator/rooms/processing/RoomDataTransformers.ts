
import { StandardizedRoom } from "@/types/room-types";

/**
 * Transforms room data between different formats
 */

export const createStandardizedRoom = (
  roomId: string,
  label: string,
  surfaces: any,
  confidence: number = 0.5
): StandardizedRoom => {
  return {
    id: roomId,
    label: label || roomId,
    walls: Boolean(surfaces.walls),
    ceiling: Boolean(surfaces.ceiling),
    trim: Boolean(surfaces.trim),
    doors: typeof surfaces.doors === 'number' ? Math.max(0, surfaces.doors) : 0,
    windows: typeof surfaces.windows === 'number' ? Math.max(0, surfaces.windows) : 0,
    cabinets: Boolean(surfaces.cabinets),
    confidence: confidence
  };
};

export const validateRoomStructure = (room: any, index: number): boolean => {
  if (!room || typeof room !== 'object') {
    console.error(`validateRoomStructure - Invalid room object at index ${index}:`, room);
    return false;
  }
  
  if (!room.room_id || typeof room.room_id !== 'string') {
    console.error(`validateRoomStructure - Invalid room_id at index ${index}:`, room.room_id);
    return false;
  }
  
  if (!room.surfaces || typeof room.surfaces !== 'object') {
    console.error(`validateRoomStructure - Invalid surfaces object at index ${index}:`, room.surfaces);
    return false;
  }
  
  return true;
};

export const meetsConfidenceThreshold = (confidence: number, threshold: number = 0.25): boolean => {
  return confidence >= threshold;
};
