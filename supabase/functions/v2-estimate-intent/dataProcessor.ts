
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
  console.log('dataProcessor - Input estimateData:', estimateData);
  console.log('dataProcessor - Input clientInfo:', clientInfo);
  console.log('dataProcessor - Input totals:', totals);
  console.log('dataProcessor - Input companyProfile:', companyProfile);

  // Only use fallbacks if values are truly undefined/null, not if they're empty strings or 0
  const result = {
    // Client Information - prioritize actual data over fallbacks
    clientName: estimateData?.clientName || clientInfo?.name || 'Valued Client',
    clientEmail: estimateData?.clientEmail || clientInfo?.email || '',
    clientPhone: estimateData?.clientPhone || clientInfo?.phone || '',
    projectAddress: estimateData?.projectAddress || estimateData?.address || clientInfo?.address || 'Project Address',
    
    // Company Information - using correct property names
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
    
    // Financial Information - ensure numbers are preserved even if 0
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

  console.log('dataProcessor - Prepared structured input:', result);
  return result;
}

export function buildPrompt(promptTemplate: string, structuredInput: any) {
  let prompt = promptTemplate;
  
  // Replace all placeholders with actual data
  const replacements = {
    '{{CLIENT_NAME}}': structuredInput.clientName,
    '{{CLIENT_EMAIL}}': structuredInput.clientEmail,
    '{{CLIENT_PHONE}}': structuredInput.clientPhone,
    '{{PROJECT_ADDRESS}}': structuredInput.projectAddress,
    '{{COMPANY_NAME}}': structuredInput.companyName,
    '{{ESTIMATOR_NAME}}': structuredInput.estimatorName,
    '{{ESTIMATOR_EMAIL}}': structuredInput.estimatorEmail,
    '{{ESTIMATOR_PHONE}}': structuredInput.estimatorPhone,
    '{{COMPANY_ADDRESS}}': structuredInput.companyAddress,
    '{{PROJECT_TYPE}}': structuredInput.projectType,
    '{{SUBTOTAL}}': structuredInput.subtotal.toString(),
    '{{TAX}}': structuredInput.tax.toString(),
    '{{TOTAL}}': structuredInput.total.toString(),
    '{{TAX_RATE}}': structuredInput.taxRate,
    '{{ESTIMATE_DATE}}': structuredInput.estimateDate,
    '{{ESTIMATE_NUMBER}}': structuredInput.estimateNumber,
    '{{PROPOSAL_NUMBER}}': structuredInput.proposalNumber,
    '{{CLIENT_NOTES}}': structuredInput.clientNotes,
    '{{ROOMS_MATRIX}}': JSON.stringify(structuredInput.roomsMatrix),
    '{{UPSELLS}}': JSON.stringify(structuredInput.upsells),
    '{{COLOR_APPROVALS}}': JSON.stringify(structuredInput.colorApprovals),
    '{{ADD_ONS}}': JSON.stringify(structuredInput.addOns)
  };
  
  Object.entries(replacements).forEach(([placeholder, value]) => {
    prompt = prompt.replace(new RegExp(placeholder, 'g'), value || '');
  });
  
  return prompt;
}
