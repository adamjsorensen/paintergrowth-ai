
import { StandardizedRoom, ExtractedRoom } from "@/types/room-types";
import { validateStandardizedRoom } from "./validation/RoomValidationUtils";
import { processRoomsFromAIFormat, processRoomsFromFields, applySurfacesToRooms } from "./processing/RoomProcessingUtils";
import { generateLineItemsFromRooms } from "./line-items/LineItemsGenerator";

interface ExtractedField {
  name: string;
  value: any;
  confidence: number;
  formField: string;
}

// Process room data from extracted fields and return standardized room objects
export const extractRoomsFromFields = (extractedData: Record<string, any>) => {
  console.log('=== EXTRACT ROOMS FROM FIELDS START ===');
  console.log('extractRoomsFromFields - Input data:', JSON.stringify(extractedData, null, 2));
  
  // Input validation
  if (!extractedData || typeof extractedData !== 'object') {
    console.error('extractRoomsFromFields - Invalid input data:', extractedData);
    return { extractedRooms: {}, extractedRoomsList: [] };
  }
  
  // Get fields and rooms arrays from extractedData
  const fields = Array.isArray(extractedData.fields) ? extractedData.fields : [];
  const rooms = Array.isArray(extractedData.rooms) ? extractedData.rooms : [];
  
  console.log('extractRoomsFromFields - Processing rooms array:', rooms);
  console.log('extractRoomsFromFields - Processing fields array:', fields);
  
  let extractedRooms: Record<string, StandardizedRoom> = {};
  let extractedRoomsList: string[] = [];
  
  // Process room data from the rooms array (new AI format)
  if (rooms.length > 0) {
    const result = processRoomsFromAIFormat(rooms);
    extractedRooms = result.extractedRooms;
    extractedRoomsList = result.extractedRoomsList;
  }
  
  // If no rooms were found in the rooms array, fall back to the old way of finding rooms
  if (extractedRoomsList.length === 0) {
    console.log('extractRoomsFromFields - No rooms found in rooms array, falling back to fields parsing');
    
    const result = processRoomsFromFields(fields);
    extractedRooms = result.extractedRooms;
    extractedRoomsList = result.extractedRoomsList;
    
    // Apply general surfaces to the fallback rooms
    applySurfacesToRooms(extractedRooms, extractedRoomsList, fields);
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

// Re-export the line items generation function
export { generateLineItemsFromRooms } from "./line-items/LineItemsGenerator";
