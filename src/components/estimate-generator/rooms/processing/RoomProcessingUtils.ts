
import { StandardizedRoom, ExtractedRoom } from "@/types/room-types";
import { processRoomsFromAIFormat } from "./AIRoomProcessor";

/**
 * Main room processing utilities - now focused on coordination
 * Individual processing logic has been moved to dedicated files
 */

// Re-export the AI processing function for backward compatibility
export { processRoomsFromAIFormat } from "./AIRoomProcessor";

/**
 * Process rooms from extracted data (main entry point)
 */
export const processExtractedRooms = (rooms: ExtractedRoom[]): {
  extractedRooms: Record<string, StandardizedRoom>;
  extractedRoomsList: string[];
} => {
  console.log('processExtractedRooms - Processing rooms using AI-first approach');
  return processRoomsFromAIFormat(rooms);
};
