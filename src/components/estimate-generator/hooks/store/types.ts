
import { StandardizedRoom } from '@/types/room-types';

export interface ProjectMetadata {
  trimColor: string;
  wallColors: number;
  coats: 'one' | 'two';
  paintType: string;
  specialConsiderations: string;
  salesNotes: string;
  productionDate: Date | undefined;
  discountPercent: number;
}

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
