
import { useState, useEffect } from 'react';
import { EstimateStore, UseEstimateStoreProps } from './types';
import { useProjectMetadata } from './useProjectMetadata';
import { useRoomMatrix } from './useRoomMatrix';
import { useLineItems } from './useLineItems';
import { useTotalsCalculation } from './useTotalsCalculation';

export const useEstimateStore = ({ extractedData, projectType }: UseEstimateStoreProps) => {
  const { projectMetadata } = useProjectMetadata();
  const { roomsMatrix, setRoomsMatrix, initializeRoomMatrix, isInitialized } = useRoomMatrix(extractedData);
  const { generateLineItemsFromRooms, hasSelectedSurfaces } = useLineItems();
  const { calculateTotals } = useTotalsCalculation();

  // Central estimate store
  const [estimateStore, setEstimateStore] = useState<EstimateStore>({
    projectDetails: extractedData,
    projectMetadata,
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
