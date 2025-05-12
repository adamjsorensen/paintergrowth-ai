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
    
    return processedField;
  });
  
  // Add a special field for matrix selector if we have rooms to paint
  const surfacesField = processedData.fields.find((f: any) => f.formField === 'surfacesToPaint');
  if (surfacesField && Array.isArray(surfacesField.value)) {
    // Extract room names from the transcript
    const roomsFromTranscript = extractRoomsFromFields(processedData.fields);
    
    if (roomsFromTranscript.length > 0) {
      // Create a new field for the matrix selector
      const matrixField = {
        name: 'Rooms to Paint',
        formField: 'roomsToPaint',
        value: roomsFromTranscript,
        confidence: surfacesField.confidence || 0.7
      };
      
      console.log(`Created matrix field for rooms: ${JSON.stringify(matrixField.value)}`);
      
      // Add the matrix field to the fields array
      processedData.fields.push(matrixField);
    }
  }
  
  return processedData;
}

/**
 * Extracts room names from various fields in the extracted data
 */
function extractRoomsFromFields(fields: any[]): string[] {
  const rooms = new Set<string>();
  
  // Common room names to look for in the transcript
  const commonRooms = [
    'kitchen', 'living room', 'dining room', 'bedroom', 'bathroom', 'master bedroom',
    'guest bedroom', 'hallway', 'entryway', 'foyer', 'office', 'study', 'den',
    'family room', 'laundry room', 'basement', 'attic', 'garage', 'closet',
    'pantry', 'utility room', 'powder room', 'mudroom', 'sunroom', 'porch'
  ];
  
  // Look for room mentions in special notes or other text fields
  fields.forEach(field => {
    if (typeof field.value === 'string') {
      const text = field.value.toLowerCase();
      
      // Check for common room names in the text
      commonRooms.forEach(room => {
        if (text.includes(room)) {
          // Format the room name with proper capitalization
          const formattedRoom = room
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          
          rooms.add(formattedRoom);
        }
      });
    }
  });
  
  // Look for specific room mentions in the projectAddress field
  const addressField = fields.find(f => f.formField === 'projectAddress');
  if (addressField && typeof addressField.value === 'string') {
    // Extract room mentions from the address (often contains room details)
    extractRoomsFromText(addressField.value).forEach(room => rooms.add(room));
  }
  
  // Look for specific room mentions in the specialNotes field
  const notesField = fields.find(f => f.formField === 'specialNotes');
  if (notesField && typeof notesField.value === 'string') {
    // Extract room mentions from notes
    extractRoomsFromText(notesField.value).forEach(room => rooms.add(room));
  }
  
  return Array.from(rooms);
}

/**
 * Extracts room names from a text string using pattern matching
 */
function extractRoomsFromText(text: string): string[] {
  const rooms = new Set<string>();
  const lowerText = text.toLowerCase();
  
  // Common room names to look for
  const commonRooms = [
    'kitchen', 'living room', 'dining room', 'bedroom', 'bathroom', 'master bedroom',
    'guest bedroom', 'hallway', 'entryway', 'foyer', 'office', 'study', 'den',
    'family room', 'laundry room', 'basement', 'attic', 'garage', 'closet',
    'pantry', 'utility room', 'powder room', 'mudroom', 'sunroom', 'porch'
  ];
  
  // Check for common room names
  commonRooms.forEach(room => {
    if (lowerText.includes(room)) {
      // Format the room name with proper capitalization
      const formattedRoom = room
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      rooms.add(formattedRoom);
    }
  });
  
  // Look for patterns like "X bedrooms" or "Y bathrooms"
  const bedroomMatch = lowerText.match(/(\d+)\s*bedrooms?/);
  if (bedroomMatch && bedroomMatch[1]) {
    const count = parseInt(bedroomMatch[1], 10);
    if (count === 1) {
      rooms.add('Bedroom');
    } else if (count === 2) {
      rooms.add('Master Bedroom');
      rooms.add('Guest Bedroom');
    } else if (count > 2) {
      rooms.add('Master Bedroom');
      for (let i = 1; i < count; i++) {
        rooms.add(`Bedroom ${i+1}`);
      }
    }
  }
  
  const bathroomMatch = lowerText.match(/(\d+)\s*bathrooms?/);
  if (bathroomMatch && bathroomMatch[1]) {
    const count = parseInt(bathroomMatch[1], 10);
    if (count === 1) {
      rooms.add('Bathroom');
    } else if (count === 2) {
      rooms.add('Master Bathroom');
      rooms.add('Guest Bathroom');
    } else if (count > 2) {
      rooms.add('Master Bathroom');
      for (let i = 1; i < count; i++) {
        rooms.add(`Bathroom ${i+1}`);
      }
    }
  }
  
  return Array.from(rooms);
}