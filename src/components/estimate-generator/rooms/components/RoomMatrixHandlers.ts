
import { StandardizedRoom } from "@/types/room-types";
import { validateRoomUpdate } from "./RoomValidation";

/**
 * Event handlers for room matrix interactions
 */

export const createCheckboxHandler = (
  workingMatrix: StandardizedRoom[],
  onChange: (matrix: StandardizedRoom[]) => void
) => {
  return (roomId: string, columnId: string, checked: boolean) => {
    console.log(`=== CHECKBOX CHANGE ===`);
    console.log(`RoomsMatrixField - Checkbox change: ${roomId}.${columnId} = ${checked}`);
    
    if (!roomId || !columnId) {
      console.error('RoomsMatrixField - Invalid parameters for checkbox change:', { roomId, columnId, checked });
      return;
    }
    
    const updatedMatrix = workingMatrix.map(room => {
      if (room.id === roomId) {
        const updatedRoom = { ...room, [columnId]: checked };
        console.log(`RoomsMatrixField - Updated room ${roomId}:`, updatedRoom);
        
        if (!validateRoomUpdate(updatedRoom)) {
          console.error(`RoomsMatrixField - Updated room ${roomId} is invalid:`, updatedRoom);
          return room;
        }
        
        return updatedRoom;
      }
      return room;
    });
    
    console.log('RoomsMatrixField - Sending updated matrix to parent:', updatedMatrix);
    onChange(updatedMatrix);
  };
};

export const createNumberHandler = (
  workingMatrix: StandardizedRoom[],
  onChange: (matrix: StandardizedRoom[]) => void
) => {
  return (roomId: string, columnId: string, value: number) => {
    console.log(`=== NUMBER CHANGE ===`);
    console.log(`RoomsMatrixField - Number change: ${roomId}.${columnId} = ${value}`);
    
    if (!roomId || !columnId) {
      console.error('RoomsMatrixField - Invalid parameters for number change:', { roomId, columnId, value });
      return;
    }
    
    const validatedValue = typeof value === 'number' && value >= 0 ? Math.floor(value) : 0;
    if (validatedValue !== value) {
      console.warn(`RoomsMatrixField - Invalid number value ${value}, using ${validatedValue} instead`);
    }
    
    const updatedMatrix = workingMatrix.map(room => {
      if (room.id === roomId) {
        const updatedRoom = { ...room, [columnId]: validatedValue };
        console.log(`RoomsMatrixField - Updated room ${roomId}:`, updatedRoom);
        
        if (!validateRoomUpdate(updatedRoom)) {
          console.error(`RoomsMatrixField - Updated room ${roomId} is invalid:`, updatedRoom);
          return room;
        }
        
        return updatedRoom;
      }
      return room;
    });
    
    console.log('RoomsMatrixField - Sending updated matrix to parent:', updatedMatrix);
    onChange(updatedMatrix);
  };
};
