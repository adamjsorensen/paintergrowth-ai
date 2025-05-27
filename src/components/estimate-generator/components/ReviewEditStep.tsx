
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FileText, Home, Receipt, AlertTriangle } from 'lucide-react';

// Import existing mobile components
import MobileReviewStep from './MobileReviewStep';
import MobilePricingStep from './MobilePricingStep';
import RoomMatrixMobile from '../rooms/components/RoomMatrixMobile';

// Import room configuration
import { roomRows, roomGroups } from '../rooms/config/RoomDefinitions';
import { StandardizedRoom } from '@/types/room-types';
import { extractRoomsFromFields } from '../rooms/RoomExtractionUtils';

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
  roomsMatrix: StandardizedRoom[];
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

  // Initialize room matrix properly on mount
  useEffect(() => {
    console.debug('ReviewEditStep - Component mounted, initializing room matrix');
    
    if (projectType === 'interior' && estimateStore.roomsMatrix.length === 0) {
      const initialMatrix = initializeRoomMatrix();
      console.debug('ReviewEditStep - Setting initial room matrix:', initialMatrix);
      
      setEstimateStore(prev => ({
        ...prev,
        roomsMatrix: initialMatrix
      }));
      
      // Generate initial line items and totals
      const newLineItems = generateLineItemsFromRooms(initialMatrix);
      const newTotals = calculateTotals(newLineItems);
      
      setEstimateStore(prev => ({
        ...prev,
        roomsMatrix: initialMatrix,
        lineItems: newLineItems,
        totals: newTotals
      }));
      
      console.debug('ReviewEditStep - Room matrix initialized with line items:', { 
        roomCount: initialMatrix.length, 
        lineItemCount: newLineItems.length,
        totals: newTotals 
      });
    }
  }, [projectType]);

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
  const generateLineItemsFromRooms = (roomsMatrix: StandardizedRoom[]) => {
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
  const hasSelectedSurfaces = (room: StandardizedRoom) => {
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

  // Handle project details updates from Tab 1
  const handleProjectDetailsUpdate = (updatedData: Record<string, any>) => {
    console.log('ReviewEditStep - Project details updated:', updatedData);
    updateEstimate('projectDetails', updatedData);
  };

  // Handle room matrix changes from Tab 2
  const handleRoomsMatrixChange = (updatedMatrix: StandardizedRoom[]) => {
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

  const toggleGroupVisibility = (groupId: string) => {
    console.log('ReviewEditStep - Toggle group visibility:', groupId);
    // This will be implemented when RoomMatrixMobile is properly integrated
  };

  const isRoomExtracted = (roomId: string) => {
    // Check if room was extracted from AI
    const { extractedRoomsList } = extractRoomsFromFields(extractedData);
    return extractedRoomsList.includes(roomId);
  };

  // Use proper group visibility mapping that matches config
  const visibleGroups = roomGroups.reduce((acc, group) => {
    acc[group.id] = true; // All groups visible by default
    return acc;
  }, {} as Record<string, boolean>);

  const extractedRoomsList = extractRoomsFromFields(extractedData).extractedRoomsList;

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
                      visibleGroups={visibleGroups}
                      extractedRoomsList={extractedRoomsList}
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
