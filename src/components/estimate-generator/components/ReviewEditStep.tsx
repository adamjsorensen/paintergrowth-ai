// …imports unchanged…

// ----------------  FILE: ReviewEditStep.tsx  ----------------
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FileText, Home, Receipt, AlertTriangle } from 'lucide-react';

// Import existing mobile components
import MobileReviewStep from './MobileReviewStep';
import MobilePricingStep from './MobilePricingStep';
import RoomsTabContent from './tabs/RoomsTabContent';

// Import hooks
import { useEstimateStore } from './hooks/useEstimateStore';
import { useTabValidation } from './hooks/useTabValidation';

// Import room configuration
import { extractRoomsFromFields } from '../rooms/RoomExtractionUtils';

interface ReviewEditStepProps {
  summary: string;
  transcript: string;
  extractedData: Record<string, any>;
  missingInfo: Record<string, any>;
  projectType: 'interior' | 'exterior';
  onComplete: (fields: Record<string, any>, finalEstimate: Record<string, any>) => void;
}

const ReviewEditStep: React.FC<ReviewEditStepProps> = ({
  summary,
  transcript,
  extractedData,
  missingInfo,
  projectType,
  onComplete
}) => {
  const [activeTab, setActiveTab] = useState('project');
  
  // Use custom hooks for state management
  const { estimateStore, updateEstimate, hasSelectedSurfaces } = useEstimateStore({
    extractedData,
    projectType
  });

  const { tabValidation } = useTabValidation({
    projectType,
    projectDetails: estimateStore.projectDetails,
    roomsMatrix: estimateStore.roomsMatrix,
    lineItems: estimateStore.lineItems,
    hasSelectedSurfaces
  });

  console.log('ReviewEditStep - Current estimate store:', estimateStore);
  console.log('ReviewEditStep - Project type:', projectType);
  console.log('ReviewEditStep - Tab validation:', tabValidation);

  /* ---------- project / rooms / pricing handlers unchanged ---------- */

  // Handle final completion
  const handlePricingComplete = (
    fields: Record<string, any>,
    finalEstimate: Record<string, any>
  ) => {
    console.log('ReviewEditStep - Final completion:', { fields, finalEstimate });
    
    /** --------------  FIX: widen the type here -------------- **/
    const combinedFields: Record<string, any> = {
      ...estimateStore.projectDetails,
      ...missingInfo,
      ...fields,
      project_metadata: estimateStore.projectMetadata
    };
    /** ------------------------------------------------------- **/

    // Add rooms matrix if interior project
    if (projectType === 'interior') {
      combinedFields.roomsMatrix = estimateStore.roomsMatrix;
    }

    const finalEstimateData = {
      ...finalEstimate,
      lineItems: estimateStore.lineItems,
      totals: estimateStore.totals
    };

    onComplete(combinedFields, finalEstimateData);
  };

  /* ---------- rest of component unchanged ---------- */

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      {/* …full JSX unchanged… */}
    </div>
  );
};

export default ReviewEditStep;
