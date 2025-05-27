
import { StandardizedRoom } from '@/types/room-types';

export const useLineItems = () => {
  // Helper pricing functions
  const calculateWallsPrice = (roomLabel: string): number => {
    const roomLower = roomLabel.toLowerCase();
    if (roomLower.includes('kitchen') || roomLower.includes('bathroom')) return 400;
    if (roomLower.includes('master') || roomLower.includes('living')) return 350;
    return 300;
  };

  const calculateCeilingPrice = (roomLabel: string): number => {
    const roomLower = roomLabel.toLowerCase();
    if (roomLower.includes('kitchen') || roomLower.includes('bathroom')) return 250;
    if (roomLower.includes('master') || roomLower.includes('living')) return 200;
    return 180;
  };

  const calculateCabinetPrice = (roomLabel: string): number => {
    const roomLower = roomLabel.toLowerCase();
    if (roomLower.includes('kitchen')) return 1800;
    if (roomLower.includes('bathroom')) return 700;
    return 500;
  };

  // Check if room has selected surfaces
  const hasSelectedSurfaces = (room: StandardizedRoom) => {
    return room.walls || room.ceiling || room.trim || room.doors > 0 || room.windows > 0 || room.cabinets;
  };

  // Generate line items from rooms matrix
  const generateLineItemsFromRooms = (roomsMatrix: StandardizedRoom[]) => {
    console.log('useEstimateStore - Generating line items from rooms:', roomsMatrix);
    
    const selectedRooms = roomsMatrix.filter(room => hasSelectedSurfaces(room));
    const lineItems = [];
    let itemId = 1;

    selectedRooms.forEach(room => {
      if (room.walls) {
        lineItems.push({
          id: `item-${itemId++}`,
          description: `Paint ${room.label} - Walls`,
          quantity: 1,
          rate: calculateWallsPrice(room.label),
          amount: calculateWallsPrice(room.label)
        });
      }
      
      if (room.ceiling) {
        lineItems.push({
          id: `item-${itemId++}`,
          description: `Paint ${room.label} - Ceiling`,
          quantity: 1,
          rate: calculateCeilingPrice(room.label),
          amount: calculateCeilingPrice(room.label)
        });
      }
      
      if (room.trim) {
        lineItems.push({
          id: `item-${itemId++}`,
          description: `Paint ${room.label} - Trim/Baseboards`,
          quantity: 1,
          rate: 250,
          amount: 250
        });
      }
      
      if (room.doors > 0) {
        lineItems.push({
          id: `item-${itemId++}`,
          description: `Paint ${room.label} - Doors`,
          quantity: room.doors,
          rate: 100,
          amount: 100 * room.doors
        });
      }
      
      if (room.windows > 0) {
        lineItems.push({
          id: `item-${itemId++}`,
          description: `Paint ${room.label} - Window Trim`,
          quantity: room.windows,
          rate: 75,
          amount: 75 * room.windows
        });
      }
      
      if (room.cabinets) {
        lineItems.push({
          id: `item-${itemId++}`,
          description: `Paint ${room.label} - Cabinets`,
          quantity: 1,
          rate: calculateCabinetPrice(room.label),
          amount: calculateCabinetPrice(room.label)
        });
      }
    });

    // Add general items if we have room-specific items
    if (lineItems.length > 0) {
      lineItems.push({
        id: `item-${itemId++}`,
        description: 'Surface Preparation',
        quantity: 1,
        rate: 350,
        amount: 350
      });
      
      lineItems.push({
        id: `item-${itemId++}`,
        description: 'Premium Paint and Materials',
        quantity: 1,
        rate: 450,
        amount: 450
      });
    }

    console.log('useEstimateStore - Generated line items:', lineItems);
    return lineItems;
  };

  return {
    generateLineItemsFromRooms,
    hasSelectedSurfaces,
    calculateWallsPrice,
    calculateCeilingPrice,
    calculateCabinetPrice
  };
};
