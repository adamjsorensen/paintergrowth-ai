
import { StandardizedRoom } from '@/types/room-types';
import { roomRows, roomGroups, floorGroups } from '../config/RoomDefinitions';

export type FloorGroupedRooms = {
  [floorId: string]: {
    [groupId: string]: StandardizedRoom[];
  };
};

/**
 * Groups rooms by floor, then by room group for hierarchical display
 */
export const groupRoomsByFloor = (workingMatrix: StandardizedRoom[]): FloorGroupedRooms => {
  const grouped: FloorGroupedRooms = {};

  // Initialize structure
  floorGroups.forEach(floor => {
    grouped[floor.id] = {};
    roomGroups.forEach(group => {
      grouped[floor.id][group.id] = [];
    });
  });

  // Group rooms
  workingMatrix.forEach(room => {
    // Find room definition to get floor, or use room's floor property directly
    const roomDef = roomRows.find(r => r.id === room.id);
    const floor = room.floor || roomDef?.floor || 'main'; // Default to main floor
    const group = roomDef?.group || 'additional'; // Default to additional

    if (!grouped[floor]) {
      grouped[floor] = {};
    }
    if (!grouped[floor][group]) {
      grouped[floor][group] = [];
    }

    grouped[floor][group].push(room);
  });

  return grouped;
};

/**
 * Counts selected rooms by floor
 */
export const countSelectedRoomsByFloor = (
  floorGroupedRooms: FloorGroupedRooms,
  hasSelectedSurfaces: (room: StandardizedRoom) => boolean
): Record<string, { selected: number; total: number }> => {
  const counts: Record<string, { selected: number; total: number }> = {};

  Object.entries(floorGroupedRooms).forEach(([floorId, groups]) => {
    let selected = 0;
    let total = 0;

    Object.values(groups).forEach(rooms => {
      rooms.forEach(room => {
        total++;
        if (hasSelectedSurfaces(room)) {
          selected++;
        }
      });
    });

    counts[floorId] = { selected, total };
  });

  return counts;
};

/**
 * Counts selected rooms by group within a floor
 */
export const countSelectedRoomsByGroup = (
  rooms: StandardizedRoom[],
  hasSelectedSurfaces: (room: StandardizedRoom) => boolean
): { selected: number; total: number } => {
  const selected = rooms.filter(hasSelectedSurfaces).length;
  return { selected, total: rooms.length };
};
