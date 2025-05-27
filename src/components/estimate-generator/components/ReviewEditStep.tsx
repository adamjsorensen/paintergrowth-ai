
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

  // Handle project details updates from Tab 1
  const handleProjectDetailsUpdate = (updatedData: Record<string, any>) => {
    console.log('ReviewEditStep - Project details updated:', updatedData);
    
    // Extract project metadata if it exists
    const { project_metadata, ...otherData } = updatedData;
    
    // Update project details (excluding project_metadata)
    updateEstimate('projectDetails', otherData);
    
    // Update project metadata separately if it exists
    if (project_metadata) {
      updateEstimate('projectMetadata', project_metadata);
    }
  };

  // Handle project metadata updates
  const handleProjectMetadataUpdate = (metadata: any) => {
    console.log('ReviewEditStep - Project metadata updated:', metadata);
    updateEstimate('projectMetadata', metadata);
  };

  // Handle room matrix changes from Tab 2
  const handleRoomsMatrixChange = (updatedMatrix: any[]) => {
    console.log('ReviewEditStep - Rooms matrix updated:', updatedMatrix);
    updateEstimate('roomsMatrix', updatedMatrix);
  };

  // Handle pricing changes from Tab 3
  const handlePricingUpdate = (lineItems: any[], totals: Record<string, any>) => {
    console.log('ReviewEditStep - Pricing updated:', { lineItems, totals });
    updateEstimate('lineItems', lineItems);
    updateEstimate('totals', totals);
  };

  // Handle final completion
  const handlePricingComplete = (fields: Record<string, any>, finalEstimate: Record<string, any>) => {
    console.log('ReviewEditStep - Final completion:', { fields, finalEstimate });
    
    // Combine all data from the estimate store
    const combinedFields = {
      ...estimateStore.projectDetails,
      ...missingInfo,
      ...fields,
      project_metadata: estimateStore.projectMetadata
    };

    // Add rooms matrix if interior project
    if (projectType === 'interior') {
      combinedFields.roomsMatrix = estimateStore.roomsMatrix;
    }

    // Use the most current data from store
    const finalEstimateData = {
      ...finalEstimate,
      lineItems: estimateStore.lineItems,
      totals: estimateStore.totals
    };

    onComplete(combinedFields, finalEstimateData);
  };

  // Room matrix handlers with proper state management
  const handleCheckboxChange = (roomId: string, columnId: string, checked: boolean) => {
    console.debug('=== CHECKBOX CHANGE ===');
    console.debug('ReviewEditStep - Checkbox change:', { roomId, columnId, checked });
    console.debug('ReviewEditStep - Current matrix before update:', estimateStore.roomsMatrix);
    
    const updatedMatrix = estimateStore.roomsMatrix.map(room => {
      if (room.id === roomId) {
        const updatedRoom = { ...room, [columnId]: checked };
        console.debug('ReviewEditStep - Updated room:', updatedRoom);
        return updatedRoom;
      }
      return room;
    });
    
    console.debug('ReviewEditStep - Updated matrix:', updatedMatrix);
    handleRoomsMatrixChange(updatedMatrix);
  };

  const handleNumberChange = (roomId: string, columnId: string, value: number) => {
    console.debug('=== NUMBER CHANGE ===');
    console.debug('ReviewEditStep - Number change:', { roomId, columnId, value });
    console.debug('ReviewEditStep - Current matrix before update:', estimateStore.roomsMatrix);
    
    const validatedValue = typeof value === 'number' && value >= 0 ? Math.floor(value) : 0;
    
    const updatedMatrix = estimateStore.roomsMatrix.map(room => {
      if (room.id === roomId) {
        const updatedRoom = { ...room, [columnId]: validatedValue };
        console.debug('ReviewEditStep - Updated room:', updatedRoom);
        return updatedRoom;
      }
      return room;
    });
    
    console.debug('ReviewEditStep - Updated matrix:', updatedMatrix);
    handleRoomsMatrixChange(updatedMatrix);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <h1 className="text-lg font-semibold text-center mb-4">Review & Edit Estimate</h1>
        
        {/* Segmented Controls */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="project" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Details</span>
              {!tabValidation.project && (
                <Badge variant="destructive" className="h-4 w-4 p-0 flex items-center justify-center">
                  <AlertTriangle className="h-2 w-2" />
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="rooms" 
              className="flex items-center gap-2"
              disabled={projectType === 'exterior'}
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Rooms</span>
              {projectType === 'interior' && !tabValidation.rooms && (
                <Badge variant="destructive" className="h-4 w-4 p-0 flex items-center justify-center">
                  <AlertTriangle className="h-2 w-2" />
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="pricing" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              <span className="hidden sm:inline">Pricing</span>
              {!tabValidation.pricing && (
                <Badge variant="destructive" className="h-4 w-4 p-0 flex items-center justify-center">
                  <AlertTriangle className="h-2 w-2" />
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <div className="mt-6">
            <TabsContent value="project" className="mt-0">
              <div className="min-h-[60vh]">
                <MobileReviewStep
                  summary={summary}
                  transcript={transcript}
                  extractedData={estimateStore.projectDetails}
                  projectMetadata={estimateStore.projectMetadata}
                  onComplete={handleProjectDetailsUpdate}
                  onProjectMetadataChange={handleProjectMetadataUpdate}
                />
              </div>
            </TabsContent>

            <TabsContent value="rooms" className="mt-0">
              <div className="min-h-[60vh] px-4">
                <RoomsTabContent
                  projectType={projectType}
                  roomsMatrix={estimateStore.roomsMatrix}
                  extractedData={extractedData}
                  hasSelectedSurfaces={hasSelectedSurfaces}
                  onCheckboxChange={handleCheckboxChange}
                  onNumberChange={handleNumberChange}
                  onSetActiveTab={setActiveTab}
                />
              </div>
            </TabsContent>

            <TabsContent value="pricing" className="mt-0">
              <div className="min-h-[60vh]">
                <MobilePricingStep
                  transcript={transcript}
                  summary={summary}
                  missingInfo={missingInfo}
                  projectType={projectType}
                  extractedData={estimateStore.projectDetails}
                  lineItems={estimateStore.lineItems}
                  totals={estimateStore.totals}
                  onComplete={handlePricingComplete}
                  onPricingUpdate={handlePricingUpdate}
                />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default ReviewEditStep;
