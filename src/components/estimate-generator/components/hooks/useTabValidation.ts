
import { useState, useEffect, useMemo } from 'react';
import { StandardizedRoom } from '@/types/room-types';

interface TabValidationState {
  project: boolean;
  rooms: boolean;
  pricing: boolean;
}

interface UseTabValidationProps {
  projectType: 'interior' | 'exterior';
  projectDetails: Record<string, any>;
  roomsMatrix: StandardizedRoom[];
  lineItems: any[];
  hasSelectedSurfaces: (room: StandardizedRoom) => boolean;
}

export const useTabValidation = ({ 
  projectType, 
  projectDetails, 
  roomsMatrix, 
  lineItems, 
  hasSelectedSurfaces 
}: UseTabValidationProps) => {
  const tabValidation = useMemo<TabValidationState>(() => ({
    project: Object.keys(projectDetails).length > 0,
    rooms: projectType === 'exterior' || roomsMatrix.some(room => hasSelectedSurfaces(room)),
    pricing: lineItems.length > 0
  }), [projectDetails, roomsMatrix, lineItems, projectType, hasSelectedSurfaces]);

  return { tabValidation };
};
