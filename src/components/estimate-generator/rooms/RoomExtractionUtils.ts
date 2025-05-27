
import { StandardizedRoom, ExtractedRoom } from "@/types/room-types";
import { validateStandardizedRoom } from "./validation/RoomValidationUtils";
import { processRoomsFromAIFormat } from "./processing/RoomProcessingUtils";
import { generateLineItemsFromRooms } from "./line-items/LineItemsGenerator";

interface ExtractedField {
  name: string;
  value: any;
  confidence: number;
  formField: string;
}

// Process room data from extracted fields using AI-first approach
export const extractRoomsFromFields = (extractedData: Record<string, any>) => {
  console.log('=== AI-FIRST ROOM EXTRACTION START ===');
  console.log('extractRoomsFromFields - Input data:', JSON.stringify(extractedData, null, 2));
  
  // Input validation
  if (!extractedData || typeof extractedData !== 'object') {
    console.error('extractRoomsFromFields - Invalid input data:', extractedData);
    return { extractedRooms: {}, extractedRoomsList: [] };
  }
  
  // Get rooms array from extractedData (AI extraction)
  const rooms = Array.isArray(extractedData.rooms) ? extractedData.rooms : [];
  
  console.log('extractRoomsFromFields - Processing AI-extracted rooms:', rooms);
  
  let extractedRooms: Record<string, StandardizedRoom> = {};
  let extractedRoomsList: string[] = [];
  
  // Process room data from the AI (primary and only method now)
  if (rooms.length > 0) {
    const result = processRoomsFromAIFormat(rooms);
    extractedRooms = result.extractedRooms;
    extractedRoomsList = result.extractedRoomsList;
    
    console.log('extractRoomsFromFields - AI extracted rooms successfully:', {
      roomCount: Object.keys(extractedRooms).length,
      roomIds: extractedRoomsList
    });
  } else {
    console.warn('extractRoomsFromFields - No rooms found in AI extraction. This may indicate an issue with the AI prompt or transcript.');
  }
  
  console.log('=== AI-FIRST ROOM EXTRACTION COMPLETE ===');
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

// Re-export the line items generation function
export { generateLineItemsFromRooms } from "./line-items/LineItemsGenerator";
