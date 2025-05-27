
import { StandardizedRoom } from '@/types/room-types';
import { generateLineItemsFromRooms } from '../../rooms/RoomExtractionUtils';

export const useLineItems = () => {
  const hasSelectedSurfaces = (rooms: StandardizedRoom[]): boolean => {
    return rooms.some(room => 
      room.walls || room.ceiling || room.trim || room.doors > 0 || room.windows > 0 || room.cabinets
    );
  };

  const hasSelectedSurfacesForRoom = (room: StandardizedRoom): boolean => {
    return room.walls || room.ceiling || room.trim || room.doors > 0 || room.windows > 0 || room.cabinets;
  };

  return {
    generateLineItemsFromRooms,
    hasSelectedSurfaces,
    hasSelectedSurfacesForRoom
  };
};
