
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp } from 'lucide-react';
import RoomsMatrixField from './rooms/RoomsMatrixField';
import { useEstimateProcessing } from './estimate-review/hooks/useEstimateProcessing';
import LoadingCard from './estimate-review/components/LoadingCard';
import ExtractedInformationTable from './estimate-review/components/ExtractedInformationTable';
import EstimateDetailsTable from './estimate-review/components/EstimateDetailsTable';
import { generateLineItemsFromRooms } from './rooms/RoomExtractionUtils';
import { StandardizedRoom } from '@/types/room-types';
import { ProjectMetadata } from './types/ProjectMetadata';
import { groupRoomsByFloor, countSelectedRoomsByFloor, countSelectedRoomsByGroup } from './rooms/utils/FloorGroupingUtils';
import { floorGroups, roomGroups } from './rooms/config/RoomDefinitions';
import { interiorRoomsMatrixConfig } from './rooms/InteriorRoomsConfig';

interface EstimateReviewProps {
  transcript: string;
  summary: string;
  missingInfo: Record<string, any>;
  projectType: 'interior' | 'exterior';
  extractedData?: Record<string, any>;
  onComplete: (fields: Record<string, any>, finalEstimate: Record<string, any>) => void;
}

interface DiscountSettings {
  enabled: boolean;
  type: 'fixed' | 'percentage';
  value: number;
  notes: string;
}

const EstimateReview: React.FC<EstimateReviewProps> = ({ 
  transcript, 
  summary, 
  missingInfo, 
  projectType,
  extractedData,
  onComplete 
}) => {
  const {
    isLoading,
    isExtracting,
    extractionProgress,
    estimateFields,
    setEstimateFields,
    lineItems,
    setLineItems,
    roomsMatrix,
    setRoomsMatrix,
    extractedRoomsList
  } = useEstimateProcessing(transcript, summary, missingInfo, projectType, extractedData);

  // Initialize project metadata
  const [projectMetadata, setProjectMetadata] = useState<ProjectMetadata>({
    trimColor: '',
    wallColors: 1,
    coats: 'two',
    paintType: 'Premium Interior Paint',
    projectNotes: '',
    internalNotes: '',
    productionDate: undefined,
    discountPercent: 0
  });

  const [subtotal, setSubtotal] = useState(() => {
    // Initialize subtotal from existing line items if any
    return lineItems.reduce((sum, item) => sum + (item.total || 0), 0);
  });
  
  const [discount, setDiscount] = useState<DiscountSettings>({
    enabled: false,
    type: 'percentage',
    value: 0,
    notes: ''
  });
  
  const [taxRate, setTaxRate] = useState(7.5);

  // Floor collapse state management
  const [floorCollapseStates, setFloorCollapseStates] = useState<Record<string, boolean>>(
    floorGroups.reduce((acc, floor) => ({ ...acc, [floor.id]: true }), {})
  );

  // Calculate default accordion states
  const getExtractedInfoDefaultState = () => {
    const highConfidenceFields = estimateFields.filter(field => field.confidence > 0.8);
    const percentage = estimateFields.length > 0 ? (highConfidenceFields.length / estimateFields.length) : 0;
    return percentage > 0.7 ? [] : ['extracted-info']; // collapsed if >70% high confidence
  };

  const [accordionValue, setAccordionValue] = useState<string[]>(() => [
    ...getExtractedInfoDefaultState(),
    'rooms-to-paint'
  ]);

  // Calculate discount amount
  const calculateDiscountAmount = () => {
    if (!discount.enabled) return 0;
    
    if (discount.type === 'fixed') {
      return Math.min(discount.value, subtotal);
    } else {
      return subtotal * (discount.value / 100);
    }
  };

  // Calculate totals
  const discountAmount = calculateDiscountAmount();
  const postDiscountSubtotal = subtotal - discountAmount;
  const tax = postDiscountSubtotal * (taxRate / 100);
  const total = postDiscountSubtotal + tax;

  // Handle project metadata changes
  const handleFieldChange = (field: keyof ProjectMetadata, value: any) => {
    setProjectMetadata({
      ...projectMetadata,
      [field]: value
    });
  };

  // Check if a room has any surfaces selected
  const hasSelectedSurfaces = (room: StandardizedRoom) => {
    return interiorRoomsMatrixConfig.columns.some(column => {
      if (column.type === "checkbox") {
        return room[column.id as keyof StandardizedRoom] === true;
      } else if (column.type === "number") {
        return (room[column.id as keyof StandardizedRoom] as number) > 0;
      }
      return false;
    });
  };

  // Handle room matrix changes with standardized room objects
  const handleRoomsMatrixChange = (updatedMatrix: any[]) => {
    console.log('=== ROOM MATRIX CHANGE START ===');
    console.log('EstimateReview - Room matrix changed:', updatedMatrix);
    console.log('EstimateReview - Matrix length:', updatedMatrix.length);
    
    const validatedMatrix = updatedMatrix.filter((room, index) => {
      const isValid = room && 
                     typeof room === 'object' && 
                     room.id && 
                     room.label && 
                     typeof room.walls === 'boolean' &&
                     typeof room.ceiling === 'boolean' &&
                     typeof room.trim === 'boolean' &&
                     typeof room.doors === 'number' &&
                     typeof room.windows === 'number' &&
                     typeof room.cabinets === 'boolean';
      
      if (!isValid) {
        console.error(`EstimateReview - Invalid room in matrix at index ${index}:`, room);
      }
      
      return isValid;
    });
    
    console.log(`EstimateReview - Valid rooms in matrix: ${validatedMatrix.length}/${updatedMatrix.length}`);
    setRoomsMatrix(validatedMatrix);
    
    console.log('EstimateReview - Converting matrix rooms to standardized rooms');
    const selectedRooms = validatedMatrix.filter(room => room.selected);
    console.log('EstimateReview - Selected rooms from updated matrix:', selectedRooms);
    
    const selectedStandardizedRooms: StandardizedRoom[] = selectedRooms.map((room, index) => {
      console.log(`EstimateReview - Converting selected room ${index + 1}:`, room);
      
      const standardized = {
        id: room.id,
        label: room.label,
        walls: room.walls,
        ceiling: room.ceiling,
        trim: room.trim,
        doors: room.doors,
        windows: room.windows,
        cabinets: room.cabinets,
        confidence: room.confidence || 0.5
      };
      
      console.log(`EstimateReview - Converted selected room ${index + 1}:`, standardized);
      return standardized;
    });
    
    console.log('EstimateReview - Final selected standardized rooms:', selectedStandardizedRooms);
    
    const newLineItems = generateLineItemsFromRooms(selectedStandardizedRooms);
    console.log('EstimateReview - Generated new line items from updated matrix:', newLineItems);
    
    setLineItems(newLineItems);
    
    // Update subtotal based on new line items
    const newSubtotal = newLineItems.reduce((sum, item) => sum + (item.total || 0), 0);
    setSubtotal(newSubtotal);
    
    console.log('=== ROOM MATRIX CHANGE COMPLETE ===');
  };

  // Handle tax rate change
  const handleTaxRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRate = parseFloat(e.target.value) || 0;
    setTaxRate(newRate);
  };

  // Complete the estimate
  const handleComplete = () => {
    const finalEstimate = {
      clientName: estimateFields.find(f => f.formField === 'clientName')?.value || '',
      clientEmail: estimateFields.find(f => f.formField === 'clientEmail')?.value || '',
      clientPhone: estimateFields.find(f => f.formField === 'clientPhone')?.value || '',
      projectAddress: estimateFields.find(f => f.formField === 'projectAddress')?.value || '',
      jobType: projectType,
      subtotal,
      discount,
      discountAmount,
      taxRate,
      tax,
      total,
      projectMetadata,
      createdAt: new Date().toISOString(),
      status: 'draft'
    };
    
    const fieldsObject = estimateFields.reduce((acc, field) => {
      acc[field.formField] = field.value;
      return acc;
    }, {} as Record<string, any>);
    
    // Add project metadata to fields
    fieldsObject.projectMetadata = projectMetadata;
    
    if (projectType === 'interior') {
      fieldsObject.roomsMatrix = roomsMatrix;
    }
    
    onComplete(fieldsObject, finalEstimate);
  };

  // Update subtotal when lineItems change (from room matrix)
  React.useEffect(() => {
    if (lineItems.length > 0) {
      const calculatedSubtotal = lineItems.reduce((sum, item) => sum + (item.total || 0), 0);
      setSubtotal(calculatedSubtotal);
    }
  }, [lineItems]);

  // Group rooms by floor and get counts
  const floorGroupedRooms = groupRoomsByFloor(roomsMatrix);
  const floorCounts = countSelectedRoomsByFloor(floorGroupedRooms, hasSelectedSurfaces);

  return (
    <div className="space-y-6">
      {isLoading ? (
        <LoadingCard isExtracting={isExtracting} extractionProgress={extractionProgress} />
      ) : (
        <>
          {/* Project Information - Remove outer Card wrapper */}
          <Accordion 
            type="multiple" 
            value={accordionValue} 
            onValueChange={setAccordionValue}
            className="w-full border rounded-lg shadow-sm"
          >
            <AccordionItem value="extracted-info" className="border-none">
              <AccordionTrigger className="px-6 py-4 hover:no-underline border-b">
                <div className="text-left">
                  <h3 className="text-xl font-semibold">Project Information</h3>
                  <p className="text-sm text-muted-foreground">
                    Review and edit extracted information and project settings
                  </p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 py-6 space-y-6">
                <ExtractedInformationTable 
                  estimateFields={estimateFields}
                  setEstimateFields={setEstimateFields}
                />
                
                {/* Project Settings Fields */}
                <div className="space-y-4 border-t pt-4">
                  <h4 className="text-sm font-medium text-muted-foreground">Project Settings</h4>
                  
                  {/* Trim Color */}
                  <div className="space-y-2">
                    <Label htmlFor="trimColor">Trim Color</Label>
                    <Input
                      id="trimColor"
                      value={projectMetadata.trimColor}
                      onChange={(e) => handleFieldChange('trimColor', e.target.value)}
                      placeholder="e.g., Semi-Gloss White"
                    />
                  </div>

                  {/* Number of Coats */}
                  <div className="space-y-3">
                    <Label>Number of Coats</Label>
                    <RadioGroup
                      value={projectMetadata.coats}
                      onValueChange={(value) => handleFieldChange('coats', value)}
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="one" id="one-coat" />
                        <Label htmlFor="one-coat">One</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="two" id="two-coats" />
                        <Label htmlFor="two-coats">Two</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Paint Type */}
                  <div className="space-y-2">
                    <Label htmlFor="paintType">Paint Type</Label>
                    <Input
                      id="paintType"
                      value={projectMetadata.paintType}
                      onChange={(e) => handleFieldChange('paintType', e.target.value)}
                      placeholder="e.g., Sherwin Williams ProClassic"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          {/* Rooms to Paint - Floor-based collapsible sections */}
          {projectType === 'interior' && (
            <Accordion 
              type="multiple" 
              value={accordionValue} 
              onValueChange={setAccordionValue}
              className="w-full border rounded-lg shadow-sm"
            >
              <AccordionItem value="rooms-to-paint" className="border-none">
                <AccordionTrigger className="px-6 py-4 hover:no-underline border-b">
                  <div className="text-left">
                    <h3 className="text-xl font-semibold">Rooms to Paint</h3>
                    <p className="text-sm text-muted-foreground">
                      Select rooms and surfaces to include in your estimate
                    </p>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 py-6">
                  <div className="space-y-4">
                    {/* Floor-based grouping */}
                    {floorGroups.map(floor => {
                      const floorRooms = Object.values(floorGroupedRooms[floor.id] || {}).flat();
                      if (floorRooms.length === 0) return null;

                      const floorCount = floorCounts[floor.id] || { selected: 0, total: 0 };
                      const isOpen = floorCollapseStates[floor.id];

                      return (
                        <Collapsible
                          key={floor.id}
                          open={isOpen}
                          onOpenChange={(open) => 
                            setFloorCollapseStates(prev => ({ ...prev, [floor.id]: open }))
                          }
                        >
                          <div className="border rounded-lg">
                            <CollapsibleTrigger asChild>
                              <Button
                                variant="ghost"
                                className="w-full p-4 justify-between hover:bg-gray-50 rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="font-medium">{floor.label}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {floorCount.selected} / {floorCount.total}
                                  </Badge>
                                </div>
                                {isOpen ? (
                                  <ChevronUp className="h-4 w-4 text-gray-500" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-gray-500" />
                                )}
                              </Button>
                            </CollapsibleTrigger>
                            
                            <CollapsibleContent>
                              <div className="p-4 border-t">
                                <RoomsMatrixField 
                                  matrixValue={floorRooms}
                                  onChange={handleRoomsMatrixChange}
                                  extractedRoomsList={extractedRoomsList}
                                />
                              </div>
                            </CollapsibleContent>
                          </div>
                        </Collapsible>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
          
          <EstimateDetailsTable
            subtotal={subtotal}
            onSubtotalChange={setSubtotal}
            discount={discount}
            onDiscountChange={setDiscount}
            tax={tax}
            total={total}
            taxRate={taxRate}
            onTaxRateChange={handleTaxRateChange}
          />
          
          <div className="flex justify-end">
            <Button onClick={handleComplete}>
              Complete Estimate
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default EstimateReview;
