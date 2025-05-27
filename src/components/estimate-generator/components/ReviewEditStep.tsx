
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FileText, Home, Receipt, AlertTriangle } from 'lucide-react';

// Import existing mobile components
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

interface EstimateStore {
  projectDetails: Record<string, any>;
  roomsMatrix: any[];
  lineItems: any[];
  totals: Record<string, any>;
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
  
  // Central estimate store
  const [estimateStore, setEstimateStore] = useState<EstimateStore>({
    projectDetails: extractedData,
    roomsMatrix: [],
    lineItems: [],
    totals: {}
  });

  // Track validation state for each tab
  const [tabValidation, setTabValidation] = useState({
    project: true,
    rooms: true,
    pricing: false
  });

  console.log('ReviewEditStep - Current estimate store:', estimateStore);
  console.log('ReviewEditStep - Project type:', projectType);
  console.log('ReviewEditStep - Tab validation:', tabValidation);

  // Unified state update helper
  const updateEstimate = (section: keyof EstimateStore, payload: any) => {
    console.log(`ReviewEditStep - Updating ${section}:`, payload);
    
    setEstimateStore(prev => {
      const updated = { ...prev, [section]: payload };
      
      // If rooms change, regenerate line items and recalculate totals
      if (section === 'roomsMatrix') {
        const newLineItems = generateLineItemsFromRooms(payload);
        const newTotals = calculateTotals(newLineItems);
        updated.lineItems = newLineItems;
        updated.totals = newTotals;
        console.log('ReviewEditStep - Auto-regenerated line items and totals:', { newLineItems, newTotals });
      }
      
      // If line items change, recalculate totals
      if (section === 'lineItems') {
        const newTotals = calculateTotals(payload);
        updated.totals = newTotals;
        console.log('ReviewEditStep - Recalculated totals:', newTotals);
      }
      
      return updated;
    });
    
    // Update validation state
    updateTabValidation(section, payload);
  };

  // Generate line items from rooms matrix
  const generateLineItemsFromRooms = (roomsMatrix: any[]) => {
    console.log('ReviewEditStep - Generating line items from rooms:', roomsMatrix);
    
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

    console.log('ReviewEditStep - Generated line items:', lineItems);
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
  const hasSelectedSurfaces = (room: any) => {
    return room.walls || room.ceiling || room.trim || room.doors > 0 || room.windows > 0 || room.cabinets;
  };

  // Update tab validation state
  const updateTabValidation = (section: keyof EstimateStore, payload: any) => {
    setTabValidation(prev => {
      const updated = { ...prev };
      
      switch (section) {
        case 'projectDetails':
          updated.project = Object.keys(payload).length > 0;
          break;
        case 'roomsMatrix':
          updated.rooms = projectType === 'exterior' || payload.some((room: any) => hasSelectedSurfaces(room));
          break;
        case 'lineItems':
          updated.pricing = payload.length > 0;
          break;
      }
      
      return updated;
    });
  };

  // Initialize store with existing data
  useEffect(() => {
    console.log('ReviewEditStep - Initializing store with extracted data');
    updateEstimate('projectDetails', extractedData);
    
    // Initialize with empty rooms matrix for interior projects
    if (projectType === 'interior') {
      updateEstimate('roomsMatrix', []);
    }
  }, [extractedData, projectType]);

  // Handle project details updates from Tab 1
  const handleProjectDetailsUpdate = (updatedData: Record<string, any>) => {
    console.log('ReviewEditStep - Project details updated:', updatedData);
    updateEstimate('projectDetails', updatedData);
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
      ...fields
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

  // Mock handlers for room matrix (will be properly implemented when RoomMatrixMobile is integrated)
  const handleCheckboxChange = (roomId: string, columnId: string, checked: boolean) => {
    console.log('ReviewEditStep - Checkbox change:', { roomId, columnId, checked });
    
    const updatedMatrix = estimateStore.roomsMatrix.map(room => 
      room.id === roomId ? { ...room, [columnId]: checked } : room
    );
    handleRoomsMatrixChange(updatedMatrix);
  };

  const handleNumberChange = (roomId: string, columnId: string, value: number) => {
    console.log('ReviewEditStep - Number change:', { roomId, columnId, value });
    
    const updatedMatrix = estimateStore.roomsMatrix.map(room => 
      room.id === roomId ? { ...room, [columnId]: value } : room
    );
    handleRoomsMatrixChange(updatedMatrix);
  };

  const toggleGroupVisibility = (groupId: string) => {
    console.log('ReviewEditStep - Toggle group visibility:', groupId);
    // This will be implemented when RoomMatrixMobile is properly integrated
  };

  const isRoomExtracted = (roomId: string) => {
    // This will be implemented when room extraction logic is integrated
    return false;
  };

  // Mock data for room matrix (will be replaced with proper room configuration)
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
                      workingMatrix={estimateStore.roomsMatrix}
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
                    <p className="text-gray-500">Rooms are only used for interior estimates.</p>
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
