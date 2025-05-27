
import { useState, useEffect, useRef } from 'react';
import { StandardizedRoom } from '@/types/room-types';
import { roomRows, roomGroups } from '../../rooms/config/RoomDefinitions';
import { extractRoomsFromFields } from '../../rooms/RoomExtractionUtils';

interface ProjectMetadata {
  trimColor: string;
  wallColors: number;
  coats: 'one' | 'two';
  paintType: string;
  specialConsiderations: string;
  salesNotes: string;
  productionDate: Date | undefined;
  discountPercent: number;
}

interface EstimateStore {
  projectDetails: Record<string, any>;
  projectMetadata: ProjectMetadata;
  roomsMatrix: StandardizedRoom[];
  lineItems: any[];
  totals: Record<string, any>;
}

interface UseEstimateStoreProps {
  extractedData: Record<string, any>;
  projectType: 'interior' | 'exterior';
}

export const useEstimateStore = ({ extractedData, projectType }: UseEstimateStoreProps) => {
  // Ref to track if room matrix has been initialized to prevent re-initialization
  const isInitialized = useRef(false);
  
  // Helper function to initialize room matrix from config
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

  // Initialize project metadata with defaults
  const initializeProjectMetadata = (): ProjectMetadata => {
    return {
      trimColor: '',
      wallColors: 1,
      coats: 'two',
      paintType: 'Premium Interior Paint',
      specialConsiderations: '',
      salesNotes: '',
      productionDate: undefined,
      discountPercent: 0
    };
  };

  // Central estimate store
  const [estimateStore, setEstimateStore] = useState<EstimateStore>({
    projectDetails: extractedData,
    projectMetadata: initializeProjectMetadata(),
    roomsMatrix: [],
    lineItems: [],
    totals: {}
  });

  // Initialize room matrix properly on mount - with guards to prevent loops
  useEffect(() => {
    console.debug('useEstimateStore - Effect triggered', {
      projectType,
      isInitialized: isInitialized.current,
      roomsMatrixLength: estimateStore.roomsMatrix.length,
      hasExtractedData: Object.keys(extractedData).length > 0
    });
    
    // Guard: Only initialize if it's an interior project, not already initialized, and we don't have rooms
    if (projectType === 'interior' && !isInitialized.current && estimateStore.roomsMatrix.length === 0) {
      console.debug('useEstimateStore - Starting room matrix initialization');
      
      try {
        const initialMatrix = initializeRoomMatrix();
        const newLineItems = generateLineItemsFromRooms(initialMatrix);
        const newTotals = calculateTotals(newLineItems);
        
        // Single atomic update to prevent cascading state changes
        setEstimateStore(prev => ({
          ...prev,
          roomsMatrix: initialMatrix,
          lineItems: newLineItems,
          totals: newTotals
        }));
        
        // Mark as initialized to prevent re-initialization
        isInitialized.current = true;
        
        console.debug('useEstimateStore - Room matrix initialized successfully:', { 
          roomCount: initialMatrix.length, 
          lineItemCount: newLineItems.length,
          totals: newTotals 
        });
      } catch (error) {
        console.error('useEstimateStore - Error during room matrix initialization:', error);
        // Set flag to prevent retrying
        isInitialized.current = true;
      }
    }
  }, [projectType, extractedData]); // Simplified dependencies - only re-run if project type or extracted data changes

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

  // Calculate totals from line items
  const calculateTotals = (lineItems: any[]) => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + tax;
    
    return { subtotal, tax, total };
  };

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

  // Unified state update helper
  const updateEstimate = (section: keyof EstimateStore, payload: any) => {
    console.log(`useEstimateStore - Updating ${section}:`, payload);
    
    setEstimateStore(prev => {
      const updated = { ...prev, [section]: payload };
      
      // If rooms change, regenerate line items and recalculate totals
      if (section === 'roomsMatrix') {
        const newLineItems = generateLineItemsFromRooms(payload);
        const newTotals = calculateTotals(newLineItems);
        updated.lineItems = newLineItems;
        updated.totals = newTotals;
        console.log('useEstimateStore - Auto-regenerated line items and totals:', { newLineItems, newTotals });
      }
      
      // If line items change, recalculate totals
      if (section === 'lineItems') {
        const newTotals = calculateTotals(payload);
        updated.totals = newTotals;
        console.log('useEstimateStore - Recalculated totals:', newTotals);
      }
      
      return updated;
    });
  };

  return {
    estimateStore,
    updateEstimate,
    hasSelectedSurfaces
  };
};
