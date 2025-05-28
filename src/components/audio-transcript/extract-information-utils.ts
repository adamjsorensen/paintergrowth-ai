
/**
 * Utility functions for handling information extraction from transcripts
 */

/**
 * Processes extracted fields to ensure they're in the correct format for form fields
 * @param extractedData The data returned from the extraction API
 * @returns Processed data with properly formatted fields
 */
export function processExtractedData(extractedData: Record<string, any>): Record<string, any> {
  if (!extractedData) {
    console.warn('Invalid extracted data: data is null or undefined');
    return extractedData;
  }
  
  const processedData = { ...extractedData };
  
  // Log initial extracted data
  console.log("processExtractedData - Initial extracted data:", JSON.stringify(extractedData, null, 2));
  
  // Ensure fields array exists
  if (!processedData.fields) {
    processedData.fields = [];
  }
  
  // Process fields array if it exists
  if (Array.isArray(processedData.fields)) {
    processedData.fields = processedData.fields.map((field: any) => {
      const processedField = { ...field };
      
      // Log each field being processed
      console.log(`processExtractedData - Processing field: ${field.formField}`);
      
      // Special handling for surfacesToPaint field - ensure it's an array
      if (field.formField === 'surfacesToPaint' && field.value) {
        if (typeof field.value === 'string') {
          // Convert comma-separated string to array
          processedField.value = field.value.split(',').map((item: string) => item.trim());
        } else if (!Array.isArray(field.value)) {
          // Convert non-array to single-item array
          processedField.value = [String(field.value)];
        }
        console.log(`processExtractedData - Processed surfacesToPaint field: ${JSON.stringify(processedField.value)}`);
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
        console.log(`processExtractedData - Processed prepNeeds field: ${JSON.stringify(processedField.value)}`);
      }
      
      // Special handling for jobType field - ensure it's a valid value
      if (field.formField === 'jobType' && field.value) {
        const validJobTypes = ['interior', 'exterior', 'cabinets', 'deck', 'commercial'];
        if (typeof field.value === 'string' && !validJobTypes.includes(field.value.toLowerCase())) {
          // Default to interior if not a valid job type
          processedField.value = 'interior';
        } else if (typeof field.value === 'string') {
          // Ensure lowercase for consistency
          processedField.value = field.value.toLowerCase();
        }
        console.log(`processExtractedData - Processed jobType field: ${processedField.value}`);
      }
      
      // Special handling for squareFootage field - ensure it's a number
      if (field.formField === 'squareFootage' && field.value) {
        if (typeof field.value === 'string') {
          // Extract numbers from string (e.g., "2500 sq ft" -> 2500)
          const numericValue = field.value.replace(/[^0-9]/g, '');
          if (numericValue) {
            processedField.value = parseInt(numericValue, 10);
          }
        } else if (typeof field.value !== 'number') {
          // Try to convert to number
          const numValue = Number(field.value);
          if (!isNaN(numValue)) {
            processedField.value = numValue;
          }
        }
        console.log(`processExtractedData - Processed squareFootage field: ${processedField.value}`);
      }
      
      return processedField;
    });
  }
  
  // Ensure rooms array exists
  if (!processedData.rooms) {
    processedData.rooms = [];
  }
  
  // Process project metadata for date conversion
  if (processedData.projectMetadata) {
    console.log('processExtractedData - Processing project metadata:', processedData.projectMetadata);
    
    // Convert productionDate string to Date object if present
    if (processedData.projectMetadata.productionDate && typeof processedData.projectMetadata.productionDate === 'string') {
      try {
        const dateStr = processedData.projectMetadata.productionDate;
        // Handle various date formats
        let parsedDate = null;
        
        if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
          // YYYY-MM-DD format
          parsedDate = new Date(dateStr);
        } else {
          // Try to parse other formats
          parsedDate = new Date(dateStr);
        }
        
        if (!isNaN(parsedDate.getTime())) {
          processedData.projectMetadata.productionDate = parsedDate;
          console.log('processExtractedData - Converted production date:', parsedDate);
        } else {
          console.warn('processExtractedData - Invalid date format:', dateStr);
          processedData.projectMetadata.productionDate = undefined;
        }
      } catch (error) {
        console.error('processExtractedData - Error parsing production date:', error);
        processedData.projectMetadata.productionDate = undefined;
      }
    }
    
    // Ensure numeric fields are numbers
    if (processedData.projectMetadata.wallColors && typeof processedData.projectMetadata.wallColors === 'string') {
      processedData.projectMetadata.wallColors = parseInt(processedData.projectMetadata.wallColors, 10) || 1;
    }
    
    if (processedData.projectMetadata.discountPercent && typeof processedData.projectMetadata.discountPercent === 'string') {
      processedData.projectMetadata.discountPercent = parseFloat(processedData.projectMetadata.discountPercent) || 0;
    }
    
    // Ensure coats is either 'one' or 'two'
    if (processedData.projectMetadata.coats && !['one', 'two'].includes(processedData.projectMetadata.coats)) {
      processedData.projectMetadata.coats = 'two'; // Default to two coats
    }
  }
  
  // Log the final processed data
  console.log("processExtractedData - Final processed data:", JSON.stringify(processedData, null, 2));
  
  return processedData;
}
