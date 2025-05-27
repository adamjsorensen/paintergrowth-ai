
import { StandardizedRoom, ExtractedRoom } from "@/types/room-types";
import { validateStandardizedRoom } from "../validation/RoomValidationUtils";

/**
 * Processes rooms extracted by AI into standardized format
 */
export const processRoomsFromAIFormat = (rooms: ExtractedRoom[]): {
  extractedRooms: Record<string, StandardizedRoom>;
  extractedRoomsList: string[];
} => {
  console.log('processRoomsFromAIFormat - Processing AI-extracted rooms:', rooms);
  
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
    
    // Accept rooms with confidence >= 0.25 (lowered threshold to include more AI results)
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
