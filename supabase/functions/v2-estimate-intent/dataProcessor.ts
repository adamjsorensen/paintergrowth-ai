
export function prepareStructuredInput(
  estimateData: Record<string, any>,
  projectType: string,
  totals: Record<string, any>,
  roomsMatrix: any[],
  clientNotes: string,
  companyProfile: Record<string, any>,
  clientInfo: Record<string, any>,
  taxRate: string,
  boilerplate: Record<string, any>,
  upsells: any[] = [],
  colorApprovals: any[] = []
) {
  const result = {
    // Client Information
    clientName: estimateData?.clientName || clientInfo?.name || 'Valued Client',
    clientEmail: estimateData?.clientEmail || clientInfo?.email || '',
    clientPhone: estimateData?.clientPhone || clientInfo?.phone || '',
    projectAddress: estimateData?.projectAddress || estimateData?.address || clientInfo?.address || 'Project Address',
    
    // Company Information
    companyName: companyProfile?.business_name || 'Your Company',
    estimatorName: companyProfile?.owner_name || 'Project Estimator',
    estimatorEmail: companyProfile?.email || 'estimator@company.com',
    estimatorPhone: companyProfile?.phone || '(555) 123-4567',
    companyAddress: companyProfile?.location || 'Company Address',
    
    // Project Details
    projectType,
    roomsMatrix: roomsMatrix || [],
    clientNotes: clientNotes || estimateData?.specialNotes || '',
    timeline: estimateData?.timeline || '',
    colorPalette: estimateData?.colorPalette || '',
    prepNeeds: estimateData?.prepNeeds || [],
    surfacesToPaint: estimateData?.surfacesToPaint || [],
    roomsToPaint: estimateData?.roomsToPaint || [],
    
    // Financial Information
    subtotal: typeof totals?.subtotal === 'number' ? totals.subtotal : 0,
    tax: typeof totals?.tax === 'number' ? totals.tax : 0,
    total: typeof totals?.total === 'number' ? totals.total : 0,
    taxRate: taxRate || '0%',
    
    // Additional Services
    upsells: upsells || [],
    colorApprovals: colorApprovals || [],
    addOns: estimateData?.addOns || [],
    
    // Boilerplate Content
    boilerplate: boilerplate || {},
    
    // Metadata
    estimateDate: new Date().toLocaleDateString(),
    estimateNumber: `EST-${Date.now()}`,
    proposalNumber: `PROP-${Date.now()}`
  };

  console.log('=== DEBUGGING: STRUCTURED INPUT FOR AI ===');
  console.log('Client:', result.clientName);
  console.log('Project Type:', result.projectType);
  console.log('Pricing:', `$${result.subtotal} + $${result.tax} = $${result.total}`);
  console.log('Rooms Matrix Length:', result.roomsMatrix.length);
  console.log('Line Items will be added separately');
  console.log('=== END STRUCTURED INPUT ===');

  return result;
}

export function buildPrompt(promptTemplate: string, structuredInput: any) {
  let prompt = promptTemplate;
  
  // Replace all placeholders with actual data - expanded to handle all template variables
  const replacements = {
    // Basic client info
    '{{CLIENT_NAME}}': structuredInput.clientName,
    '{{CLIENT_EMAIL}}': structuredInput.clientEmail,
    '{{CLIENT_PHONE}}': structuredInput.clientPhone,
    '{{PROJECT_ADDRESS}}': structuredInput.projectAddress,
    
    // Company info
    '{{COMPANY_NAME}}': structuredInput.companyName,
    '{{ESTIMATOR_NAME}}': structuredInput.estimatorName,
    '{{ESTIMATOR_EMAIL}}': structuredInput.estimatorEmail,
    '{{ESTIMATOR_PHONE}}': structuredInput.estimatorPhone,
    '{{COMPANY_ADDRESS}}': structuredInput.companyAddress,
    
    // Project details
    '{{PROJECT_TYPE}}': structuredInput.projectType,
    '{{SUBTOTAL}}': structuredInput.subtotal.toString(),
    '{{TAX}}': structuredInput.tax.toString(),
    '{{TOTAL}}': structuredInput.total.toString(),
    '{{TAX_RATE}}': structuredInput.taxRate,
    '{{ESTIMATE_DATE}}': structuredInput.estimateDate,
    '{{ESTIMATE_NUMBER}}': structuredInput.estimateNumber,
    '{{PROPOSAL_NUMBER}}': structuredInput.proposalNumber,
    '{{CLIENT_NOTES}}': structuredInput.clientNotes,
    
    // Complex data structures
    '{{ROOMS_MATRIX}}': JSON.stringify(structuredInput.roomsMatrix),
    '{{UPSELLS}}': JSON.stringify(structuredInput.upsells),
    '{{COLOR_APPROVALS}}': JSON.stringify(structuredInput.colorApprovals),
    '{{ADD_ONS}}': JSON.stringify(structuredInput.addOns),
    
    // Handle the template variables that use single braces like {estimateData}
    '{estimateData}': JSON.stringify({
      clientName: structuredInput.clientName,
      clientEmail: structuredInput.clientEmail,
      clientPhone: structuredInput.clientPhone,
      projectAddress: structuredInput.projectAddress,
      timeline: structuredInput.timeline,
      colorPalette: structuredInput.colorPalette,
      prepNeeds: structuredInput.prepNeeds,
      surfacesToPaint: structuredInput.surfacesToPaint,
      roomsToPaint: structuredInput.roomsToPaint,
      specialNotes: structuredInput.clientNotes
    }),
    '{projectType}': structuredInput.projectType,
    '{roomsMatrix}': JSON.stringify(structuredInput.roomsMatrix),
    '{totals}': JSON.stringify({
      subtotal: structuredInput.subtotal,
      tax: structuredInput.tax,
      total: structuredInput.total,
      taxRate: structuredInput.taxRate
    }),
    '{lineItems}': structuredInput.lineItemsJson || '[]',
    '{addOns}': JSON.stringify(structuredInput.addOns),
    '{companyProfile}': JSON.stringify({
      business_name: structuredInput.companyName,
      owner_name: structuredInput.estimatorName,
      email: structuredInput.estimatorEmail,
      phone: structuredInput.estimatorPhone,
      location: structuredInput.companyAddress
    })
  };
  
  Object.entries(replacements).forEach(([placeholder, value]) => {
    prompt = prompt.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value || '');
  });
  
  console.log('=== DEBUGGING: PLACEHOLDER REPLACEMENT ===');
  console.log('Original template length:', promptTemplate.length);
  console.log('Processed prompt length:', prompt.length);
  console.log('Sample replacements made:');
  console.log('- {projectType}:', structuredInput.projectType);
  console.log('- {estimateData} client name:', structuredInput.clientName);
  console.log('- {totals} total:', structuredInput.total);
  console.log('=== END PLACEHOLDER REPLACEMENT ===');
  
  return prompt;
}
