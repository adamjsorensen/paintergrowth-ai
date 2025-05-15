import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Check, Edit, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/utils/formatUtils';
import { processExtractedData } from '@/components/audio-transcript/extract-information-utils';
import RoomsMatrixField from './rooms/RoomsMatrixField';
import { interiorRoomsMatrixConfig, initializeRoomsMatrix } from './rooms/InteriorRoomsConfig';
import { extractRoomsFromFields, generateLineItemsFromRooms } from './rooms/RoomExtractionUtils';

interface EstimateReviewProps {
  transcript: string;
  summary: string;
  missingInfo: Record<string, any>;
  projectType: 'interior' | 'exterior';
  onComplete: (fields: Record<string, any>, finalEstimate: Record<string, any>) => void;
}

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

const EstimateReview: React.FC<EstimateReviewProps> = ({ 
  transcript, 
  summary, 
  missingInfo, 
  projectType,
  onComplete 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isExtracting, setIsExtracting] = useState(true);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [estimateFields, setEstimateFields] = useState<EstimateField[]>([]);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);
  const [taxRate, setTaxRate] = useState(7.5); // Default tax rate
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  
  // Room matrix state
  const [roomsMatrix, setRoomsMatrix] = useState<any[]>([]);
  const [extractedRoomsList, setExtractedRoomsList] = useState<string[]>([]);

  // Extract information from transcript and generate estimate
  useEffect(() => {
    const extractInformation = async () => {
      setIsExtracting(true);
      setExtractionProgress(0);
      
      try {
        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setExtractionProgress(prev => {
            const newProgress = prev + Math.random() * 15;
            return newProgress > 95 ? 95 : newProgress;
          });
        }, 500);
        
        // Call the extract-information edge function
        const { data, error } = await supabase.functions.invoke('extract-information', {
          body: { transcript }
        });
        
        clearInterval(progressInterval);
        
        if (error) {
          throw new Error(error.message || "Information extraction failed");
        }
        
        if (!data) {
          throw new Error("No information extracted");
        }
        
        setExtractionProgress(100);
        
        // Process the extracted fields
        const processedData = processExtractedData(data);
        const processedFields = processedData.fields || [];
        
        const formattedFields = processedFields.map((field: any) => ({
          name: field.name,
          value: field.value,
          confidence: field.confidence,
          formField: field.formField,
          editable: true
        }));
        
        // Add missing info to the fields
        Object.entries(missingInfo).forEach(([key, value]) => {
          // Check if the field already exists
          const existingField = formattedFields.find(field => field.formField === key);
          
          if (existingField) {
            existingField.value = value;
            existingField.confidence = 1.0; // User-provided info has 100% confidence
          } else {
            // Add as a new field
            formattedFields.push({
              name: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()), // Convert camelCase to Title Case
              value,
              confidence: 1.0,
              formField: key,
              editable: true
            });
          }
        });
        
        setEstimateFields(formattedFields);
        
        // For interior projects, extract room information
        if (projectType === 'interior') {
          const { extractedRooms, extractedRoomsList } = extractRoomsFromFields(processedData);
          
          // Initialize room matrix with extracted data
          const initialMatrix = initializeRoomsMatrix(extractedRooms);
          setRoomsMatrix(initialMatrix);
          setExtractedRoomsList(extractedRoomsList);
          
          // Generate line items based on room data
          const generatedLineItems = generateLineItemsFromRooms(initialMatrix);
          setLineItems(generatedLineItems);
          
          // Calculate totals
          calculateTotals(generatedLineItems);
        } else {
          // For exterior projects, use the original line item generation
          generateLineItems(formattedFields, projectType);
        }
      } catch (error) {
        console.error("Information extraction error:", error);
        // Create some default fields if extraction fails
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
        
        setEstimateFields(defaultFields);
        
        // Initialize empty room matrix for interior projects
        if (projectType === 'interior') {
          setRoomsMatrix(initializeRoomsMatrix());
        }
      } finally {
        setIsExtracting(false);
        setIsLoading(false);
      }
    };
    
    extractInformation();
  }, [transcript, missingInfo, projectType]);

  // Calculate totals based on line items
  const calculateTotals = (items: LineItem[]) => {
    const calculatedSubtotal = items.reduce((sum, item) => sum + item.total, 0);
    setSubtotal(calculatedSubtotal);
    
    const calculatedTax = calculatedSubtotal * (taxRate / 100);
    setTax(calculatedTax);
    setTotal(calculatedSubtotal + calculatedTax);
  };

  // Generate line items based on extracted information (for non-room based estimates)
  const generateLineItems = (fields: EstimateField[], projectType: 'interior' | 'exterior') => {
    const items: LineItem[] = [];
    let itemId = 1;
    
    // Helper function to add a line item
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
    
    // Check for rooms to paint
    const surfacesField = fields.find(f => f.formField === 'surfacesToPaint');
    
    if (surfacesField && Array.isArray(surfacesField.value) && surfacesField.value.length > 0) {
      // Add line items for each surface type
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
      // Default items if no specific surfaces mentioned
      if (projectType === 'interior') {
        addItem('Interior Painting - Walls', 1, 'project', 1500);
        addItem('Interior Painting - Trim', 1, 'project', 750);
      } else {
        addItem('Exterior Painting - Siding', 1, 'project', 3200);
        addItem('Exterior Painting - Trim', 1, 'project', 1200);
      }
    }
    
    // Check for prep work
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
      // Default prep item
      addItem('Surface Preparation', 1, 'project', 300);
    }
    
    // Add paint and materials
    addItem('Premium Paint and Materials', 1, 'project', 450);
    
    // Calculate totals
    setLineItems(items);
    calculateTotals(items);
  };

  // Handle editing a field
  const handleEditField = (formField: string, currentValue: any) => {
    setEditingField(formField);
    setEditValue(String(currentValue));
  };

  // Save edited field
  const handleSaveEdit = () => {
    if (!editingField) return;
    
    setEstimateFields(prev => 
      prev.map(field => 
        field.formField === editingField 
          ? { ...field, value: editValue, confidence: 1.0 } // Set confidence to 1.0 for user-edited fields
          : field
      )
    );
    
    setEditingField(null);
  };

  // Update line item
  const handleUpdateLineItem = (id: string, field: keyof LineItem, value: any) => {
    setLineItems(prev => 
      prev.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          
          // Recalculate total if quantity or unitPrice changes
          if (field === 'quantity' || field === 'unitPrice') {
            updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
          }
          
          return updatedItem;
        }
        return item;
      })
    );
    
    // Recalculate totals
    const newSubtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    setSubtotal(newSubtotal);
    setTax(newSubtotal * (taxRate / 100));
    setTotal(newSubtotal + (newSubtotal * (taxRate / 100)));
  };

  // Handle room matrix changes
  const handleRoomsMatrixChange = (updatedMatrix: any[]) => {
    setRoomsMatrix(updatedMatrix);
    
    // Generate new line items based on updated room data
    const newLineItems = generateLineItemsFromRooms(updatedMatrix);
    setLineItems(newLineItems);
    
    // Recalculate totals
    calculateTotals(newLineItems);
  };

  // Add new line item
  const handleAddLineItem = () => {
    const newItem: LineItem = {
      id: `item-${Date.now()}`,
      description: 'New Item',
      quantity: 1,
      unit: 'item',
      unitPrice: 0,
      total: 0
    };
    
    const newLineItems = [...lineItems, newItem];
    setLineItems(newLineItems);
    calculateTotals(newLineItems);
  };

  // Remove line item
  const handleRemoveLineItem = (id: string) => {
    const newLineItems = lineItems.filter(item => item.id !== id);
    setLineItems(newLineItems);
    calculateTotals(newLineItems);
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
    // Create a final estimate object
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
    
    // Convert estimateFields to a simple key-value object
    const fieldsObject = estimateFields.reduce((acc, field) => {
      acc[field.formField] = field.value;
      return acc;
    }, {} as Record<string, any>);
    
    // For interior projects, add the room matrix data
    if (projectType === 'interior') {
      fieldsObject.roomsMatrix = roomsMatrix;
    }
    
    onComplete(fieldsObject, finalEstimate);
  };

  // Get confidence badge variant
  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) return "default";
    if (confidence >= 0.5) return "secondary";
    return "outline";
  };

  // Format field value for display
  const formatFieldValue = (value: any): string => {
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
  };

  return (
    <div className="space-y-6">
      {isLoading ? (
        <Card>
          <CardContent className="pt-6 flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <h3 className="text-lg font-medium mb-2">Generating Estimate</h3>
            <div className="w-full max-w-md">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Extracting Information</span>
                  <span>{Math.round(extractionProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-primary h-2.5 rounded-full" 
                    style={{ width: `${extractionProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Extracted Information */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Extracted Information</h3>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Field</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {estimateFields
                      .filter(field => 
                        !field.formField.includes('Room') && 
                        field.formField !== 'roomsToPaint'
                      )
                      .map((field) => (
                      <TableRow key={field.formField}>
                        <TableCell className="font-medium">{field.name}</TableCell>
                        <TableCell>
                          {editingField === field.formField ? (
                            <Input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-full"
                            />
                          ) : (
                            formatFieldValue(field.value)
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getConfidenceBadge(field.confidence)}>
                            {Math.round(field.confidence * 100)}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {editingField === field.formField ? (
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={handleSaveEdit}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleEditField(field.formField, field.value)}
                              disabled={!field.editable}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          
          {/* Room Matrix for Interior Projects */}
          {projectType === 'interior' && (
            <RoomsMatrixField 
              matrixValue={roomsMatrix}
              onChange={handleRoomsMatrixChange}
              extractedRoomsList={extractedRoomsList}
            />
          )}
          
          {/* Estimate Line Items */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Estimate Details</h3>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-[100px]">Quantity</TableHead>
                      <TableHead className="w-[100px]">Unit</TableHead>
                      <TableHead className="w-[150px]">Unit Price</TableHead>
                      <TableHead className="w-[150px]">Total</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Input
                            value={item.description}
                            onChange={(e) => handleUpdateLineItem(item.id, 'description', e.target.value)}
                            className="w-full"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="1"
                            value={item.quantity}
                            onChange={(e) => handleUpdateLineItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                            className="w-full"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={item.unit}
                            onChange={(e) => handleUpdateLineItem(item.id, 'unit', e.target.value)}
                            className="w-full"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2">$</span>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) => handleUpdateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                              className="w-full pl-7"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(item.total)}
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleRemoveLineItem(item.id)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                              <path d="M3 6h18"></path>
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                            </svg>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleAddLineItem}
                >
                  + Add Line Item
                </Button>
              </div>
              
              {/* Totals */}
              <div className="mt-6 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Tax Rate (%)</span>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={taxRate}
                      onChange={handleTaxRateChange}
                      className="w-20"
                    />
                  </div>
                  <span>{formatCurrency(tax)}</span>
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-lg font-bold">{formatCurrency(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
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
