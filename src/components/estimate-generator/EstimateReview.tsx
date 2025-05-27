
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import RoomsMatrixField from './rooms/RoomsMatrixField';
import { useEstimateProcessing } from './estimate-review/hooks/useEstimateProcessing';
import LoadingCard from './estimate-review/components/LoadingCard';
import ExtractedInformationTable from './estimate-review/components/ExtractedInformationTable';
import EstimateDetailsTable from './estimate-review/components/EstimateDetailsTable';
import { generateLineItemsFromRooms } from './rooms/RoomExtractionUtils';
import { StandardizedRoom } from '@/types/room-types';

interface EstimateReviewProps {
  transcript: string;
  summary: string;
  missingInfo: Record<string, any>;
  projectType: 'interior' | 'exterior';
  extractedData?: Record<string, any>;
  onComplete: (fields: Record<string, any>, finalEstimate: Record<string, any>) => void;
}

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
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

  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);
  const [taxRate, setTaxRate] = useState(7.5);

  // Calculate totals based on line items
  const calculateTotals = (items: LineItem[]) => {
    const calculatedSubtotal = items.reduce((sum, item) => sum + item.total, 0);
    setSubtotal(calculatedSubtotal);
    
    const calculatedTax = calculatedSubtotal * (taxRate / 100);
    setTax(calculatedTax);
    setTotal(calculatedSubtotal + calculatedTax);
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
    calculateTotals(newLineItems);
    
    console.log('=== ROOM MATRIX CHANGE COMPLETE ===');
  };

  // Handle tax rate change
  const handleTaxRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRate = parseFloat(e.target.value);
    setTaxRate(newRate);
    
    const newTax = subtotal * (newRate / 100);
    setTax(newTax);
    setTotal(subtotal + newTax);
  };

  // Complete the estimate
  const handleComplete = () => {
    const finalEstimate = {
      clientName: estimateFields.find(f => f.formField === 'clientName')?.value || '',
      clientEmail: estimateFields.find(f => f.formField === 'clientEmail')?.value || '',
      clientPhone: estimateFields.find(f => f.formField === 'clientPhone')?.value || '',
      projectAddress: estimateFields.find(f => f.formField === 'projectAddress')?.value || '',
      jobType: projectType,
      lineItems,
      subtotal,
      taxRate,
      tax,
      total,
      createdAt: new Date().toISOString(),
      status: 'draft'
    };
    
    const fieldsObject = estimateFields.reduce((acc, field) => {
      acc[field.formField] = field.value;
      return acc;
    }, {} as Record<string, any>);
    
    if (projectType === 'interior') {
      fieldsObject.roomsMatrix = roomsMatrix;
    }
    
    onComplete(fieldsObject, finalEstimate);
  };

  // Initialize totals when lineItems change
  React.useEffect(() => {
    if (lineItems.length > 0) {
      calculateTotals(lineItems);
    }
  }, [lineItems, taxRate]);

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
          
          {projectType === 'interior' && (
            <RoomsMatrixField 
              matrixValue={roomsMatrix}
              onChange={handleRoomsMatrixChange}
              extractedRoomsList={extractedRoomsList}
            />
          )}
          
          <EstimateDetailsTable
            lineItems={lineItems}
            setLineItems={setLineItems}
            subtotal={subtotal}
            tax={tax}
            total={total}
            taxRate={taxRate}
            onTaxRateChange={handleTaxRateChange}
            onCalculateTotals={calculateTotals}
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
