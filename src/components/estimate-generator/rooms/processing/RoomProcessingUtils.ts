
import { identifyRoomFromText } from "../InteriorRoomsConfig";
import { StandardizedRoom, ExtractedRoom } from "@/types/room-types";
import { validateStandardizedRoom } from "../validation/RoomValidationUtils";

/**
 * Room processing utilities for converting extracted data to standardized format
 */

interface ExtractedField {
  name: string;
  value: any;
  confidence: number;
  formField: string;
}

// Process rooms from the new AI format
export const processRoomsFromAIFormat = (rooms: ExtractedRoom[]): {
  extractedRooms: Record<string, StandardizedRoom>;
  extractedRoomsList: string[];
} => {
  console.log('processRoomsFromAIFormat - Processing rooms array:', rooms);
  
  const extractedRooms: Record<string, StandardizedRoom> = {};
  const extractedRoomsList: string[] = [];
  
  rooms.forEach((room: ExtractedRoom, index: number) => {
    console.log(`processRoomsFromAIFormat - Processing room ${index + 1}:`, room);
    
    // Validate extracted room structure
    if (!room || typeof room !== 'object') {
      console.error(`processRoomsFromAIFormat - Invalid room object at index ${index}:`, room);
      return;
    }
    
    if (!room.room_id || typeof room.room_id !== 'string') {
      console.error(`processRoomsFromAIFormat - Invalid room_id at index ${index}:`, room.room_id);
      return;
    }
    
    if (!room.surfaces || typeof room.surfaces !== 'object') {
      console.error(`processRoomsFromAIFormat - Invalid surfaces object at index ${index}:`, room.surfaces);
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
        console.log(`processRoomsFromAIFormat - Successfully created standardized room:`, standardizedRoom);
      } else {
        console.error(`processRoomsFromAIFormat - Failed to create valid standardized room for ${room.room_id}`);
      }
    } else {
      console.log(`processRoomsFromAIFormat - Skipping room ${room.room_id} due to low confidence: ${confidence}`);
    }
  });
  
  return { extractedRooms, extractedRoomsList };
};

// Process rooms from the fallback fields format
export const processRoomsFromFields = (fields: ExtractedField[]): {
  extractedRooms: Record<string, StandardizedRoom>;
  extractedRoomsList: string[];
} => {
  console.log('processRoomsFromFields - Processing fields array:', fields);
  
  const extractedRooms: Record<string, StandardizedRoom> = {};
  const extractedRoomsList: string[] = [];
  
  // Find general rooms to paint field
  const roomsToPaintField = fields.find((field: ExtractedField) => field.formField === 'roomsToPaint');
  const roomsToPaint = Array.isArray(roomsToPaintField?.value) ? roomsToPaintField.value : [];
  
  console.log('processRoomsFromFields - Found roomsToPaint field:', roomsToPaintField);
  console.log('processRoomsFromFields - Rooms to paint:', roomsToPaint);
  
  // Process each room name from the general field
  roomsToPaint.forEach((roomName: string, index: number) => {
    console.log(`processRoomsFromFields - Processing fallback room ${index + 1}: "${roomName}"`);
    
    if (typeof roomName !== 'string') {
      console.error(`processRoomsFromFields - Invalid room name at index ${index}:`, roomName);
      return;
    }
    
    const roomId = identifyRoomFromText(roomName);
    console.log(`processRoomsFromFields - Identified room ID for "${roomName}": ${roomId}`);
    
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
        console.log(`processRoomsFromFields - Successfully created fallback room:`, standardizedRoom);
      } else {
        console.error(`processRoomsFromFields - Failed to create valid fallback room for ${roomId}`);
      }
    } else {
      console.warn(`processRoomsFromFields - Could not identify room ID for: "${roomName}"`);
    }
  });
  
  return { extractedRooms, extractedRoomsList };
};

// Apply general surfaces to rooms
export const applySurfacesToRooms = (
  extractedRooms: Record<string, StandardizedRoom>,
  extractedRoomsList: string[],
  fields: ExtractedField[]
): void => {
  // Handle surface information from general surfaces to paint
  const surfacesToPaintField = fields.find((field: ExtractedField) => field.formField === 'surfacesToPaint');
  const surfacesToPaint = Array.isArray(surfacesToPaintField?.value) ? surfacesToPaintField.value : [];
  
  console.log('applySurfacesToRooms - Found surfacesToPaint field:', surfacesToPaintField);
  console.log('applySurfacesToRooms - Surfaces to paint:', surfacesToPaint);
  
  // If we have general surfaces but no specific rooms, apply to all detected rooms
  if (surfacesToPaint.length > 0 && extractedRoomsList.length > 0) {
    console.log('applySurfacesToRooms - Applying general surfaces to rooms:', surfacesToPaint);
    
    // For each room in our list
    extractedRoomsList.forEach(roomId => {
      const room = extractedRooms[roomId];
      if (!room) {
        console.error(`applySurfacesToRooms - Room ${roomId} not found in extractedRooms`);
        return;
      }
      
      console.log(`applySurfacesToRooms - Applying surfaces to room ${roomId}:`, room);
      
      // Apply general surfaces to each room
      surfacesToPaint.forEach((surface: string) => {
        if (typeof surface !== 'string') {
          console.error('applySurfacesToRooms - Invalid surface type:', surface);
          return;
        }
        
        const surfaceLower = surface.toLowerCase();
        
        if (surfaceLower.includes('wall')) {
          room.walls = true;
          console.log(`applySurfacesToRooms - Applied walls to ${roomId}`);
        }
        if (surfaceLower.includes('ceiling')) {
          room.ceiling = true;
          console.log(`applySurfacesToRooms - Applied ceiling to ${roomId}`);
        }
        if (surfaceLower.includes('trim') || surfaceLower.includes('baseboard')) {
          room.trim = true;
          console.log(`applySurfacesToRooms - Applied trim to ${roomId}`);
        }
        if (surfaceLower.includes('door')) {
          room.doors = room.doors + 1;
          console.log(`applySurfacesToRooms - Added door to ${roomId}, total: ${room.doors}`);
        }
        if (surfaceLower.includes('window')) {
          room.windows = room.windows + 1;
          console.log(`applySurfacesToRooms - Added window to ${roomId}, total: ${room.windows}`);
        }
        if (surfaceLower.includes('cabinet')) {
          room.cabinets = true;
          console.log(`applySurfacesToRooms - Applied cabinets to ${roomId}`);
        }
      });
      
      console.log(`applySurfacesToRooms - Final room after surface application:`, room);
      
      // Re-validate room after modifications
      if (!validateStandardizedRoom(room, 'surface application')) {
        console.error(`applySurfacesToRooms - Room ${roomId} became invalid after surface application`);
      }
    });
  } else {
    console.log('applySurfacesToRooms - No surfaces to apply or no rooms to apply them to');
  }
};
