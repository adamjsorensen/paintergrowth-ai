
import { StandardizedRoom, ExtractedRoom } from "@/types/room-types";
import { validateStandardizedRoom } from "../validation/RoomValidationUtils";
import { roomTemplates, transitionalRooms, createRoomInstance } from "../config/RoomTemplates";

/**
 * Processes rooms extracted by AI into standardized format using templates
 */
export const processRoomsFromAIFormat = (rooms: ExtractedRoom[]): {
  extractedRooms: Record<string, StandardizedRoom>;
  extractedRoomsList: string[];
} => {
  console.log('processRoomsFromAIFormat - Processing AI-extracted rooms:', rooms);
  
  const extractedRooms: Record<string, StandardizedRoom> = {};
  const extractedRoomsList: string[] = [];
  
  // Create a map of category aliases to templates for matching
  const allTemplates = [...roomTemplates, ...transitionalRooms];
  const aliasMap = new Map<string, { template: any, floor: string }>();
  
  allTemplates.forEach(template => {
    // Add the main category name
    aliasMap.set(template.category.toLowerCase(), { template, floor: template.floor });
    
    // Add all aliases
    template.aliases?.forEach(alias => {
      aliasMap.set(alias.toLowerCase(), { template, floor: template.floor });
    });
  });

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
    
    // Accept rooms with confidence >= 0.25
    if (confidence >= 0.25) {
      // Try to match the room to a template
      const roomLabel = room.label.toLowerCase();
      const matchedTemplate = aliasMap.get(roomLabel) || 
                             aliasMap.get(room.room_id.toLowerCase());
      
      if (matchedTemplate) {
        // Create a room instance using the template
        const roomInstance = createRoomInstance(matchedTemplate.template, 1, room.label);
        
        extractedRoomsList.push(roomInstance.id);
        
        // Create standardized room object with validation
        const standardizedRoom: StandardizedRoom = {
          id: roomInstance.id,
          label: roomInstance.label,
          floor: roomInstance.floor as 'main' | 'upper' | 'basement',
          category: roomInstance.category,
          index: roomInstance.index,
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
          extractedRooms[roomInstance.id] = standardizedRoom;
          console.log(`processRoomsFromAIFormat - Successfully created standardized room:`, standardizedRoom);
        } else {
          console.error(`processRoomsFromAIFormat - Failed to create valid standardized room for ${room.room_id}`);
        }
      } else {
        console.warn(`processRoomsFromAIFormat - Could not match room "${room.label}" to any template`);
      }
    } else {
      console.log(`processRoomsFromAIFormat - Skipping room ${room.room_id} due to low confidence: ${confidence}`);
    }
  });
  
  return { extractedRooms, extractedRoomsList };
};
