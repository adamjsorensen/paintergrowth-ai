
export interface StructuredEstimateData {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  address: string;
  projectAddress: string;
  roomsMatrix?: any[];
  addOns?: any[];
  colorApprovals?: any[];
  timeline?: string;
  specialNotes?: string;
  colorPalette?: string;
  prepNeeds?: string[];
  surfacesToPaint?: string[];
  roomsToPaint?: string[];
  projectMetadata?: any;
}

export function parseEstimateFields(estimateFields: any[]): StructuredEstimateData {
  console.log('Parsing estimate fields:', estimateFields);
  
  if (!Array.isArray(estimateFields)) {
    console.warn('estimateFields is not an array:', estimateFields);
    return getDefaultEstimateData();
  }

  const fieldMap = estimateFields.reduce((acc, field) => {
    if (field && field.formField && field.value !== undefined) {
      acc[field.formField] = field.value;
    }
    return acc;
  }, {} as Record<string, any>);

  console.log('Field map created:', fieldMap);

  return {
    clientName: fieldMap.clientName || '',
    clientEmail: fieldMap.clientEmail || '',
    clientPhone: fieldMap.clientPhone || '',
    address: fieldMap.projectAddress || fieldMap.address || '',
    projectAddress: fieldMap.projectAddress || fieldMap.address || '',
    roomsMatrix: fieldMap.roomsMatrix || [],
    addOns: fieldMap.addOns || [],
    colorApprovals: fieldMap.colorApprovals || [],
    timeline: fieldMap.timeline || '',
    specialNotes: fieldMap.specialNotes || '',
    colorPalette: fieldMap.colorPalette || '',
    prepNeeds: Array.isArray(fieldMap.prepNeeds) ? fieldMap.prepNeeds : [],
    surfacesToPaint: Array.isArray(fieldMap.surfacesToPaint) ? fieldMap.surfacesToPaint : [],
    roomsToPaint: Array.isArray(fieldMap.roomsToPaint) ? fieldMap.roomsToPaint : [],
    projectMetadata: fieldMap.projectMetadata || fieldMap.project_metadata || {}
  };
}

function getDefaultEstimateData(): StructuredEstimateData {
  return {
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    address: '',
    projectAddress: '',
    roomsMatrix: [],
    addOns: [],
    colorApprovals: [],
    timeline: '',
    specialNotes: '',
    colorPalette: '',
    prepNeeds: [],
    surfacesToPaint: [],
    roomsToPaint: [],
    projectMetadata: {}
  };
}

export function validateEstimateData(data: StructuredEstimateData): string[] {
  const warnings: string[] = [];
  
  if (!data.clientName) warnings.push('Missing client name');
  if (!data.projectAddress) warnings.push('Missing project address');
  if (!data.clientPhone && !data.clientEmail) warnings.push('Missing client contact info');
  
  return warnings;
}
