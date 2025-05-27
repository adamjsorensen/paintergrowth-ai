
import { useState, useRef } from 'react';
import { StandardizedRoom } from '@/types/room-types';
import { roomRows } from '../../rooms/config/RoomDefinitions';
import { extractRoomsFromFields } from '../../rooms/RoomExtractionUtils';

export const useRoomMatrix = (extractedData: Record<string, any>) => {
  const isInitialized = useRef(false);
  const [roomsMatrix, setRoomsMatrix] = useState<StandardizedRoom[]>([]);

  const initializeRoomMatrix = (): StandardizedRoom[] => {
    console.debug('=== INITIALIZING ROOM MATRIX ===');
    
    // Extract rooms from AI data if available
    const { extractedRooms } = extractRoomsFromFields(extractedData);
    console.debug('Extracted rooms from AI:', extractedRooms);
    
    // Create standardized room objects for all rooms in config
    const initialMatrix: StandardizedRoom[] = roomRows.map(roomConfig => {
      const extractedRoom = extractedRooms[roomConfig.id];
      
      if (extractedRoom) {
        console.debug(`Using extracted data for room: ${roomConfig.id}`, extractedRoom);
        return {
          id: roomConfig.id,
          label: roomConfig.label,
          walls: extractedRoom.walls,
          ceiling: extractedRoom.ceiling,
          trim: extractedRoom.trim,
          doors: extractedRoom.doors || 0,
          windows: extractedRoom.windows || 0,
          cabinets: extractedRoom.cabinets,
          confidence: extractedRoom.confidence || 1
        };
      } else {
        // Create default room object
        return {
          id: roomConfig.id,
          label: roomConfig.label,
          walls: false,
          ceiling: false,
          trim: false,
          doors: 0,
          windows: 0,
          cabinets: false,
          confidence: 0
        };
      }
    });
    
    console.debug('Initialized room matrix:', initialMatrix);
    return initialMatrix;
  };

  return {
    roomsMatrix,
    setRoomsMatrix,
    initializeRoomMatrix,
    isInitialized
  };
};
