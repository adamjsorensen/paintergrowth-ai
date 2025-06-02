
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
  return {
    // Client Information
    clientName: clientInfo.name || estimateData.clientName || 'Valued Client',
    clientEmail: clientInfo.email || estimateData.clientEmail || '',
    clientPhone: clientInfo.phone || estimateData.clientPhone || '',
    projectAddress: clientInfo.address || estimateData.projectAddress || estimateData.address || 'Project Address',
    
    // Company Information
    companyName: companyProfile.company_name || 'Your Company',
    estimatorName: companyProfile.contact_name || companyProfile.owner_name || 'Project Estimator',
    estimatorEmail: companyProfile.email || 'estimator@company.com',
    estimatorPhone: companyProfile.phone || '(555) 123-4567',
    website: companyProfile.website || 'www.yourcompany.com',
    
    // Project Details
    projectType,
    roomsMatrix: roomsMatrix || [],
    clientNotes: clientNotes || '',
    
    // Financial Information
    subtotal: totals.subtotal || 0,
    tax: totals.tax || 0,
    total: totals.total || 0,
    taxRate: taxRate || '7.5%',
    
    // Additional Services
    upsells: upsells || [],
    colorApprovals: colorApprovals || [],
    
    // Boilerplate Content
    boilerplate: boilerplate || {},
    
    // Metadata
    estimateDate: new Date().toLocaleDateString(),
    estimateNumber: `EST-${Date.now()}`,
    proposalNumber: `PROP-${Date.now()}`
  };
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
    '{{WEBSITE}}': structuredInput.website,
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
    '{{COLOR_APPROVALS}}': JSON.stringify(structuredInput.colorApprovals)
  };
  
  Object.entries(replacements).forEach(([placeholder, value]) => {
    prompt = prompt.replace(new RegExp(placeholder, 'g'), value || '');
  });
  
  return prompt;
}
