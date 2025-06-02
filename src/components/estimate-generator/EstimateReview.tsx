
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import RoomsMatrixField from './rooms/RoomsMatrixField';
import { useEstimateProcessing } from './estimate-review/hooks/useEstimateProcessing';
import LoadingCard from './estimate-review/components/LoadingCard';
import ExtractedInformationTable from './estimate-review/components/ExtractedInformationTable';
import EstimateDetailsTable from './estimate-review/components/EstimateDetailsTable';
import ProjectSettingsCard from './estimate-review/components/ProjectSettingsCard';
import { generateLineItemsFromRooms } from './rooms/RoomExtractionUtils';
import { StandardizedRoom } from '@/types/room-types';
import { ProjectMetadata } from './types/ProjectMetadata';
import { parseEstimateFields, validateEstimateData } from './utils/estimateDataParser';

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
    console.log('EstimateReview - Starting completion with estimateFields:', estimateFields);
    
    // Parse estimate fields into structured data
    const structuredEstimateData = parseEstimateFields(estimateFields);
    console.log('EstimateReview - Structured estimate data:', structuredEstimateData);
    
    // Validate the data and log warnings
    const warnings = validateEstimateData(structuredEstimateData);
    if (warnings.length > 0) {
      console.warn('EstimateReview - Data validation warnings:', warnings);
    }

    const finalEstimate = {
      // Include the structured estimate data
      ...structuredEstimateData,
      
      // Financial data
      subtotal,
      discount,
      discountAmount,
      taxRate,
      tax,
      total,
      
      // Additional metadata
      projectMetadata: {
        ...projectMetadata,
        ...structuredEstimateData.projectMetadata
      },
      roomsMatrix: projectType === 'interior' ? roomsMatrix : [],
      lineItems,
      totals: {
        subtotal,
        tax,
        total,
        taxRate: `${taxRate}%`
      },
      
      // System fields
      jobType: projectType,
      createdAt: new Date().toISOString(),
      status: 'draft'
    };
    
    const fieldsObject = estimateFields.reduce((acc, field) => {
      acc[field.formField] = field.value;
      return acc;
    }, {} as Record<string, any>);
    
    // Add additional data to fields
    fieldsObject.projectMetadata = projectMetadata;
    fieldsObject.structuredEstimateData = structuredEstimateData;
    
    if (projectType === 'interior') {
      fieldsObject.roomsMatrix = roomsMatrix;
    }
    
    console.log('EstimateReview - Final estimate data:', finalEstimate);
    console.log('EstimateReview - Fields object:', fieldsObject);
    
    onComplete(fieldsObject, finalEstimate);
  };

  // Update subtotal when lineItems change (from room matrix)
  React.useEffect(() => {
    if (lineItems.length > 0) {
      const calculatedSubtotal = lineItems.reduce((sum, item) => sum + (item.total || 0), 0);
      setSubtotal(calculatedSubtotal);
    }
  }, [lineItems]);

  return (
    <div className="space-y-6">
      {isLoading ? (
        <LoadingCard isExtracting={isExtracting} extractionProgress={extractionProgress} />
      ) : (
        <>
          <ExtractedInformationTable 
            estimateFields={estimateFields}
            setEstimateFields={setEstimateFields}
          />
          
          <ProjectSettingsCard
            projectMetadata={projectMetadata}
            onProjectMetadataChange={setProjectMetadata}
          />
          
          {projectType === 'interior' && (
            <RoomsMatrixField 
              matrixValue={roomsMatrix}
              onChange={handleRoomsMatrixChange}
              extractedRoomsList={extractedRoomsList}
            />
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
