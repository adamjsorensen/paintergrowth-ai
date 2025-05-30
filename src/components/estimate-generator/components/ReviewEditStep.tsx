
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

interface DiscountSettings {
  enabled: boolean;
  type: 'fixed' | 'percentage';
  value: number;
  notes: string;
}

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
  
  // Add pricing state for the simplified mobile pricing step
  const [subtotal, setSubtotal] = useState(2450.00);
  const [discount, setDiscount] = useState<DiscountSettings>({
    enabled: false,
    type: 'percentage',
    value: 0,
    notes: ''
  });
  const [taxRate, setTaxRate] = useState(7.5);
  
  // Use custom hooks for state management
  const { estimateStore, updateEstimate, hasSelectedSurfaces, hasSelectedSurfacesForRoom } = useEstimateStore({
    extractedData,
    projectType
  });

  const { tabValidation } = useTabValidation({
    projectType,
    projectDetails: estimateStore.projectDetails,
    roomsMatrix: estimateStore.roomsMatrix,
    lineItems: estimateStore.lineItems,
    hasSelectedSurfaces: hasSelectedSurfacesForRoom
  });

  // Only log once when component mounts, not on every render
  console.log('ReviewEditStep initialized with:', { projectType, estimateStoreReady: !!estimateStore });

  // Handle project info completion (from MobileReviewStep)
  const handleProjectComplete = (info: Record<string, any>) => {
    console.log('ReviewEditStep - Project info completed:', info);
    
    // Update estimate store with project info
    updateEstimate('projectDetails', info);
    
    // Switch to rooms tab for interior projects, pricing for exterior
    if (projectType === 'interior') {
      setActiveTab('rooms');
    } else {
      setActiveTab('pricing');
    }
  };

  // Handle room matrix changes
  const handleCheckboxChange = (roomId: string, columnId: string, checked: boolean) => {
    const updatedMatrix = estimateStore.roomsMatrix.map(room => {
      if (room.id === roomId) {
        return { ...room, [columnId]: checked };
      }
      return room;
    });
    updateEstimate('roomsMatrix', updatedMatrix);
  };

  const handleNumberChange = (roomId: string, columnId: string, value: number) => {
    const updatedMatrix = estimateStore.roomsMatrix.map(room => {
      if (room.id === roomId) {
        return { ...room, [columnId]: value };
      }
      return room;
    });
    updateEstimate('roomsMatrix', updatedMatrix);
  };

  // Handle pricing updates from the mobile pricing step
  const handlePricingUpdate = (newSubtotal: number, newDiscount: DiscountSettings, newTaxRate: number) => {
    setSubtotal(newSubtotal);
    setDiscount(newDiscount);
    setTaxRate(newTaxRate);
  };

  // Handle final completion
  const handlePricingComplete = (
    fields: Record<string, any>,
    finalEstimate: Record<string, any>
  ) => {
    console.log('ReviewEditStep - Final completion:', { fields, finalEstimate });
    
    // Create combined fields with proper typing to allow dynamic properties
    const combinedFields: Record<string, any> = {
      ...estimateStore.projectDetails,
      ...missingInfo,
      ...fields,
      project_metadata: estimateStore.projectMetadata
    };

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

  // Create wrapper function for desktop MobileReviewStep to handle signature mismatch
  const handleDesktopComplete = (info: Record<string, any>) => {
    // For desktop, we just pass empty estimate data since it goes through full flow
    const emptyEstimate = {
      lineItems: [],
      totals: {}
    };
    onComplete(info, emptyEstimate);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="md:hidden">
        <TabsList className="flex justify-between bg-white">
          <TabsTrigger value="project" className="w-full py-2.5 text-sm font-medium">
            <Home className="mr-2 h-4 w-4" />
            Project
            {tabValidation.project ? null : <AlertTriangle className="ml-1 h-3 w-3 text-red-500" />}
          </TabsTrigger>
          <TabsTrigger value="rooms" className="w-full py-2.5 text-sm font-medium">
            <FileText className="mr-2 h-4 w-4" />
            Rooms
            {tabValidation.rooms ? null : <AlertTriangle className="ml-1 h-3 w-3 text-red-500" />}
          </TabsTrigger>
          <TabsTrigger value="pricing" className="w-full py-2.5 text-sm font-medium">
            <Receipt className="mr-2 h-4 w-4" />
            Pricing
            {tabValidation.pricing ? null : <AlertTriangle className="ml-1 h-3 w-3 text-red-500" />}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="project" className="space-y-2 p-4">
          <MobileReviewStep
            summary={summary}
            transcript={transcript}
            extractedData={extractedData}
            missingInfo={missingInfo}
            projectType={projectType}
            onComplete={handleProjectComplete}
          />
        </TabsContent>
        <TabsContent value="rooms" className="space-y-2 p-4">
          <RoomsTabContent
            projectType={projectType}
            roomsMatrix={estimateStore.roomsMatrix}
            extractedData={extractedData}
            hasSelectedSurfaces={hasSelectedSurfacesForRoom}
            onCheckboxChange={handleCheckboxChange}
            onNumberChange={handleNumberChange}
            onSetActiveTab={setActiveTab}
          />
        </TabsContent>
        <TabsContent value="pricing" className="space-y-2 p-4">
          <MobilePricingStep
            transcript={transcript}
            summary={summary}
            projectType={projectType}
            extractedData={extractedData}
            missingInfo={missingInfo}
            subtotal={subtotal}
            discount={discount}
            taxRate={taxRate}
            onComplete={handlePricingComplete}
            onPricingUpdate={handlePricingUpdate}
          />
        </TabsContent>
      </Tabs>

      {/* Desktop Content */}
      <div className="hidden md:block">
        <MobileReviewStep
          summary={summary}
          transcript={transcript}
          extractedData={extractedData}
          missingInfo={missingInfo}
          projectType={projectType}
          onComplete={handleDesktopComplete}
        />
      </div>
    </div>
  );
};

export default ReviewEditStep;
