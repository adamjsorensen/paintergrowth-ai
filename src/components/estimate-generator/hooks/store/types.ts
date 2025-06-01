
import { StandardizedRoom } from '@/types/room-types';
import { ProjectMetadata } from '../../types/ProjectMetadata';

export interface EstimateStore {
  projectDetails: Record<string, any>;
  projectMetadata: ProjectMetadata;
  roomsMatrix: StandardizedRoom[];
  lineItems: any[];
  totals: Record<string, any>;
}

export interface UseEstimateStoreProps {
  extractedData: Record<string, any>;
  projectType: 'interior' | 'exterior';
}
