
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { processExtractedData } from '@/components/audio-transcript/extract-information-utils';
import { extractRoomsFromFields, generateLineItemsFromRooms } from '@/components/estimate-generator/rooms/RoomExtractionUtils';
import { initializeRoomsMatrix } from '@/components/estimate-generator/rooms/InteriorRoomsConfig';
import { StandardizedRoom } from '@/types/room-types';

interface EstimateField {
  name: string;
  value: string | number | boolean | string[];
  confidence: number;
  formField: string;
  editable?: boolean;
}

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export const useEstimateProcessing = (
  transcript: string,
  summary: string,
  missingInfo: Record<string, any>,
  projectType: 'interior' | 'exterior',
  extractedData?: Record<string, any>
) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [estimateFields, setEstimateFields] = useState<EstimateField[]>([]);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [roomsMatrix, setRoomsMatrix] = useState<any[]>([]);
  const [extractedRoomsList, setExtractedRoomsList] = useState<string[]>([]);

  const generateLineItems = (fields: EstimateField[], projectType: 'interior' | 'exterior') => {
    const items: LineItem[] = [];
    let itemId = 1;
    
    const addItem = (description: string, quantity: number, unit: string, unitPrice: number) => {
      items.push({
        id: `item-${itemId++}`,
        description,
        quantity,
        unit,
        unitPrice,
        total: quantity * unitPrice
      });
    };
    
    const surfacesField = fields.find(f => f.formField === 'surfacesToPaint');
    
    if (surfacesField && Array.isArray(surfacesField.value) && surfacesField.value.length > 0) {
      const surfaces = surfacesField.value as string[];
      
      if (surfaces.includes('walls')) {
        addItem('Paint Walls', 1, 'project', 1200);
      }
      
      if (surfaces.includes('ceilings')) {
        addItem('Paint Ceilings', 1, 'project', 800);
      }
      
      if (surfaces.includes('trim') || surfaces.includes('baseboards')) {
        addItem('Paint Trim/Baseboards', 1, 'project', 600);
      }
      
      if (surfaces.includes('doors')) {
        addItem('Paint Doors', 1, 'project', 500);
      }
      
      if (surfaces.includes('cabinets')) {
        addItem('Paint Cabinets', 1, 'project', 1800);
      }
    } else {
      if (projectType === 'interior') {
        addItem('Interior Painting - Walls', 1, 'project', 1500);
        addItem('Interior Painting - Trim', 1, 'project', 750);
      } else {
        addItem('Exterior Painting - Siding', 1, 'project', 3200);
        addItem('Exterior Painting - Trim', 1, 'project', 1200);
      }
    }
    
    const prepField = fields.find(f => f.formField === 'prepNeeds');
    if (prepField && Array.isArray(prepField.value) && prepField.value.length > 0) {
      const prepNeeds = prepField.value as string[];
      
      if (prepNeeds.includes('patching') || prepNeeds.includes('repair')) {
        addItem('Wall Repair and Patching', 1, 'project', 350);
      }
      
      if (prepNeeds.includes('sanding')) {
        addItem('Surface Sanding and Preparation', 1, 'project', 250);
      }
      
      if (prepNeeds.includes('priming') || prepNeeds.includes('primer')) {
        addItem('Primer Application', 1, 'project', 400);
      }
    } else {
      addItem('Surface Preparation', 1, 'project', 300);
    }
    
    addItem('Premium Paint and Materials', 1, 'project', 450);
    
    return items;
  };

  useEffect(() => {
    const processInformation = async () => {
      console.log('=== ESTIMATE REVIEW PROCESSING START ===');
      console.log('EstimateReview - Starting with:', {
        hasExtractedData: !!extractedData,
        transcriptLength: transcript.length,
        summaryLength: summary.length,
        missingInfoKeys: Object.keys(missingInfo),
        projectType
      });
      
      setIsLoading(true);
      
      try {
        let processedData;
        
        if (extractedData && Object.keys(extractedData).length > 0) {
          console.log('EstimateReview - Using pre-extracted data:', extractedData);
          processedData = extractedData;
        } else {
          console.log('EstimateReview - No pre-extracted data, extracting from transcript');
          setIsExtracting(true);
          setExtractionProgress(0);
          
          const progressInterval = setInterval(() => {
            setExtractionProgress(prev => {
              const newProgress = prev + Math.random() * 15;
              return newProgress > 95 ? 95 : newProgress;
            });
          }, 500);
          
          const inputText = summary.trim() || transcript;
          console.log('EstimateReview - Using input text:', {
            source: summary.trim() ? 'summary' : 'transcript',
            length: inputText.length,
            preview: inputText.substring(0, 200) + '...'
          });
          
          console.log('EstimateReview - Calling extract-information function');
          const { data, error } = await supabase.functions.invoke('extract-information', {
            body: { transcript: inputText }
          });
          
          clearInterval(progressInterval);
          
          if (error) {
            console.error('EstimateReview - Extract-information error:', error);
            throw new Error(error.message || "Information extraction failed");
          }
          
          if (!data) {
            console.error('EstimateReview - No data returned from extraction');
            throw new Error("No information extracted");
          }
          
          console.log('EstimateReview - Raw extraction data:', data);
          setExtractionProgress(100);
          
          console.log('EstimateReview - Processing extracted data');
          processedData = processExtractedData(data);
          setIsExtracting(false);
        }
        
        console.log('EstimateReview - Final processed data:', processedData);
        
        const processedFields = Array.isArray(processedData.fields) ? processedData.fields : [];
        console.log('EstimateReview - Processed fields:', processedFields);
        
        const formattedFields = processedFields.map((field: any, index: number) => {
          console.log(`EstimateReview - Formatting field ${index + 1}:`, field);
          
          const formattedField = {
            name: field.name || `Field ${index + 1}`,
            value: field.value,
            confidence: typeof field.confidence === 'number' ? field.confidence : 0.5,
            formField: field.formField || `field_${index}`,
            editable: true
          };
          
          console.log(`EstimateReview - Formatted field ${index + 1}:`, formattedField);
          return formattedField;
        });
        
        console.log('EstimateReview - All formatted fields:', formattedFields);
        
        console.log('EstimateReview - Adding missing info to fields:', missingInfo);
        Object.entries(missingInfo).forEach(([key, value]) => {
          console.log(`EstimateReview - Processing missing info: ${key} = ${value}`);
          
          const existingField = formattedFields.find(field => field.formField === key);
          
          if (existingField) {
            console.log(`EstimateReview - Updating existing field ${key}:`, existingField);
            existingField.value = value;
            existingField.confidence = 1.0;
            console.log(`EstimateReview - Updated field ${key}:`, existingField);
          } else {
            const newField = {
              name: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
              value,
              confidence: 1.0,
              formField: key,
              editable: true
            };
            formattedFields.push(newField);
            console.log(`EstimateReview - Added new field ${key}:`, newField);
          }
        });
        
        console.log('EstimateReview - Final formatted fields:', formattedFields);
        setEstimateFields(formattedFields);
        
        if (projectType === 'interior') {
          console.log('=== INTERIOR PROJECT ROOM PROCESSING START ===');
          console.log('EstimateReview - Processing interior project rooms');
          
          const { extractedRooms, extractedRoomsList } = extractRoomsFromFields(processedData);
          
          console.log('EstimateReview - Extracted rooms from fields:', extractedRooms);
          console.log('EstimateReview - Extracted rooms list:', extractedRoomsList);
          console.log('EstimateReview - Total extracted rooms:', Object.keys(extractedRooms).length);
          
          console.log('EstimateReview - Initializing room matrix');
          const initialMatrix = initializeRoomsMatrix(extractedRooms);
          console.log('EstimateReview - Initialized room matrix:', initialMatrix);
          console.log('EstimateReview - Matrix length:', initialMatrix.length);
          
          setRoomsMatrix(initialMatrix);
          setExtractedRoomsList(extractedRoomsList);
          
          console.log('EstimateReview - Converting matrix rooms to standardized rooms for line items');
          const selectedRooms = initialMatrix.filter(room => room.selected);
          console.log('EstimateReview - Selected rooms from matrix:', selectedRooms);
          
          const standardizedRooms: StandardizedRoom[] = selectedRooms.map((room, index) => {
            console.log(`EstimateReview - Converting matrix room ${index + 1} to standardized:`, room);
            
            const standardized = {
              id: room.id,
              label: room.label,
              walls: room.walls,
              ceiling: room.ceiling,
              trim: room.trim,
              doors: room.doors,
              windows: room.windows,
              cabinets: room.cabinets,
              confidence: room.confidence
            };
            
            console.log(`EstimateReview - Standardized room ${index + 1}:`, standardized);
            return standardized;
          });
          
          console.log('EstimateReview - Final standardized rooms for line items:', standardizedRooms);
          const generatedLineItems = generateLineItemsFromRooms(standardizedRooms);
          console.log('EstimateReview - Generated line items from rooms:', generatedLineItems);
          
          setLineItems(generatedLineItems);
          
          console.log('=== INTERIOR PROJECT ROOM PROCESSING COMPLETE ===');
        } else {
          console.log('EstimateReview - Processing exterior project (using original method)');
          const generatedLineItems = generateLineItems(formattedFields, projectType);
          setLineItems(generatedLineItems);
        }
        
        console.log('=== ESTIMATE REVIEW PROCESSING COMPLETE ===');
      } catch (error) {
        console.error("=== ESTIMATE REVIEW PROCESSING ERROR ===");
        console.error("EstimateReview - Information processing error:", error);
        
        const defaultFields: EstimateField[] = [
          {
            name: "Client Name",
            value: "",
            confidence: 0.5,
            formField: "clientName",
            editable: true
          },
          {
            name: "Project Address",
            value: "",
            confidence: 0.5,
            formField: "projectAddress",
            editable: true
          }
        ];
        
        console.log('EstimateReview - Setting default fields due to error:', defaultFields);
        setEstimateFields(defaultFields);
        
        if (projectType === 'interior') {
          console.log('EstimateReview - Initializing empty room matrix for interior project');
          const emptyMatrix = initializeRoomsMatrix();
          console.log('EstimateReview - Empty room matrix:', emptyMatrix);
          setRoomsMatrix(emptyMatrix);
        }
      } finally {
        setIsExtracting(false);
        setIsLoading(false);
        console.log('EstimateReview - Processing completed');
      }
    };
    
    processInformation();
  }, [transcript, summary, missingInfo, projectType, extractedData]);

  return {
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
  };
};
