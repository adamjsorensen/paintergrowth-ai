/**
 * Utility functions for handling information extraction from transcripts
 */

/**
 * Processes extracted fields to ensure they're in the correct format for form fields
 * @param extractedData The data returned from the extraction API
 * @returns Processed data with properly formatted fields
 */
export function processExtractedData(extractedData: Record<string, any>): Record<string, any> {
  if (!extractedData || !extractedData.fields || !Array.isArray(extractedData.fields)) {
    console.warn('Invalid extracted data format:', extractedData);
    return extractedData;
  }

  const processedData = { ...extractedData };
  
  // Process each field
  processedData.fields = extractedData.fields.map((field: any) => {
    const processedField = { ...field };
    
    // Special handling for surfacesToPaint field - ensure it's an array
    if (field.formField === 'surfacesToPaint' && field.value) {
      if (typeof field.value === 'string') {
        // Convert comma-separated string to array
        processedField.value = field.value.split(',').map((item: string) => item.trim());
      } else if (!Array.isArray(field.value)) {
        // Convert non-array to single-item array
        processedField.value = [String(field.value)];
      }
      console.log(`Processed surfacesToPaint field: ${JSON.stringify(processedField.value)}`);
    }
    
    // Special handling for prepNeeds field - ensure it's an array
    if (field.formField === 'prepNeeds' && field.value) {
      if (typeof field.value === 'string') {
        // Convert comma-separated string to array
        processedField.value = field.value.split(',').map((item: string) => item.trim());
      } else if (!Array.isArray(field.value)) {
        // Convert non-array to single-item array
        processedField.value = [String(field.value)];
      }
      console.log(`Processed prepNeeds field: ${JSON.stringify(processedField.value)}`);
    }
    
    // Special handling for matrix-selector fields
    if (field.formField === 'surfacesToPaint' && Array.isArray(processedField.value)) {
      // Create a new field for the matrix selector
      const matrixField = {
        name: 'Rooms to Paint',
        formField: 'roomsToPaint',
        value: processedField.value,
        confidence: field.confidence
      };
      
      console.log(`Created matrix field for rooms: ${JSON.stringify(matrixField.value)}`);
      
      // Add the matrix field to the fields array
      processedData.fields.push(matrixField);
    }
    
    return processedField;
  });
  
  return processedData;
}