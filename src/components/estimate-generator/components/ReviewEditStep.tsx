
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Home, Receipt } from 'lucide-react';

// Import existing mobile components to reuse their logic
import MobileReviewStep from './MobileReviewStep';
import MobilePricingStep from './MobilePricingStep';
import RoomMatrixMobile from '../rooms/components/RoomMatrixMobile';

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
  const [localExtractedData, setLocalExtractedData] = useState(extractedData);
  const [localMissingInfo, setLocalMissingInfo] = useState(missingInfo);
  const [roomsMatrix, setRoomsMatrix] = useState<any[]>([]);

  // Handle project details updates from Tab 1
  const handleProjectDetailsUpdate = (updatedData: Record<string, any>) => {
    console.log('ReviewEditStep - Project details updated:', updatedData);
    setLocalExtractedData(updatedData);
  };

  // Handle room matrix updates from Tab 2
  const handleRoomsMatrixChange = (updatedMatrix: any[]) => {
    console.log('ReviewEditStep - Rooms matrix updated:', updatedMatrix);
    setRoomsMatrix(updatedMatrix);
  };

  // Handle final completion from Tab 3 (pricing)
  const handlePricingComplete = (fields: Record<string, any>, finalEstimate: Record<string, any>) => {
    console.log('ReviewEditStep - Final completion:', { fields, finalEstimate });
    
    // Combine all data from all tabs
    const combinedFields = {
      ...localExtractedData,
      ...localMissingInfo,
      ...fields
    };

    // Add rooms matrix if interior project
    if (projectType === 'interior') {
      combinedFields.roomsMatrix = roomsMatrix;
    }

    onComplete(combinedFields, finalEstimate);
  };

  // Mock room matrix handlers for Tab 2 (will be implemented properly later)
  const handleCheckboxChange = (roomId: string, columnId: string, checked: boolean) => {
    console.log('ReviewEditStep - Checkbox change:', { roomId, columnId, checked });
    // TODO: Implement proper room matrix update logic
  };

  const handleNumberChange = (roomId: string, columnId: string, value: number) => {
    console.log('ReviewEditStep - Number change:', { roomId, columnId, value });
    // TODO: Implement proper room matrix update logic
  };

  const toggleGroupVisibility = (groupId: string) => {
    console.log('ReviewEditStep - Toggle group visibility:', groupId);
    // TODO: Implement group visibility toggle
  };

  const isRoomExtracted = (roomId: string) => {
    // TODO: Implement proper room extraction check
    return false;
  };

  const hasSelectedSurfaces = (room: any) => {
    // TODO: Implement proper surface selection check
    return false;
  };

  // Mock data for room matrix (will be replaced with proper data)
  const mockVisibleGroups = { living: true, bedrooms: true, kitchen: true };
  const mockExtractedRoomsList: string[] = [];

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
            </TabsTrigger>
            <TabsTrigger value="rooms" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Rooms</span>
            </TabsTrigger>
            <TabsTrigger value="pricing" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              <span className="hidden sm:inline">Pricing</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <div className="mt-6">
            <TabsContent value="project" className="mt-0">
              <div className="min-h-[60vh]">
                <MobileReviewStep
                  summary={summary}
                  transcript={transcript}
                  extractedData={localExtractedData}
                  onComplete={handleProjectDetailsUpdate}
                />
              </div>
            </TabsContent>

            <TabsContent value="rooms" className="mt-0">
              <div className="min-h-[60vh] px-4">
                {projectType === 'interior' ? (
                  <>
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-semibold mb-2">Select Rooms & Surfaces</h2>
                      <p className="text-gray-600 text-sm">Choose which rooms and surfaces to include</p>
                    </div>
                    
                    <RoomMatrixMobile
                      workingMatrix={roomsMatrix}
                      visibleGroups={mockVisibleGroups}
                      extractedRoomsList={mockExtractedRoomsList}
                      onCheckboxChange={handleCheckboxChange}
                      onNumberChange={handleNumberChange}
                      onToggleGroupVisibility={toggleGroupVisibility}
                      isRoomExtracted={isRoomExtracted}
                      hasSelectedSurfaces={hasSelectedSurfaces}
                    />
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">Exterior Project</h3>
                    <p className="text-gray-500">Room selection is not needed for exterior projects.</p>
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab('pricing')}
                      className="mt-4"
                    >
                      Continue to Pricing
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="pricing" className="mt-0">
              <div className="min-h-[60vh]">
                <MobilePricingStep
                  transcript={transcript}
                  summary={summary}
                  missingInfo={localMissingInfo}
                  projectType={projectType}
                  extractedData={localExtractedData}
                  onComplete={handlePricingComplete}
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
