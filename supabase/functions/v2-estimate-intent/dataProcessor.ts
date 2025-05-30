
export function prepareStructuredInput(
  estimateData: any,
  projectType: string,
  totals: any,
  roomsMatrix: any,
  clientNotes: string,
  companyProfile: any,
  clientInfo: any,
  taxRate: string,
  boilerplate: any,
  upsells: any[],
  colorApprovals: any[]
) {
  const currentDate = new Date();
  const estimateNumber = `EST-${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}${String(currentDate.getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`;
  
  return {
    estimateData: JSON.stringify(estimateData, null, 2),
    projectType,
    totals: JSON.stringify(totals, null, 2),
    roomsMatrix: roomsMatrix ? JSON.stringify(roomsMatrix, null, 2) : 'Not provided',
    clientNotes: clientNotes || 'No additional notes',
    companyProfile: companyProfile ? JSON.stringify(companyProfile, null, 2) : 'Not provided',
    clientInfo: clientInfo ? JSON.stringify(clientInfo, null, 2) : 'Not provided',
    taxRate: taxRate || '0%',
    boilerplateTexts: JSON.stringify(boilerplate, null, 2),
    upsells: JSON.stringify(upsells, null, 2),
    colorApprovals: JSON.stringify(colorApprovals, null, 2),
    estimateNumber,
    currentDate: currentDate.toLocaleDateString('en-US'),
    validUntil: new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US')
  };
}

export function buildPrompt(promptTemplate: string, structuredInput: any): string {
  let fullPrompt = promptTemplate;
  Object.entries(structuredInput).forEach(([key, value]) => {
    fullPrompt = fullPrompt.replace(new RegExp(`{${key}}`, 'g'), value || '');
  });
  return fullPrompt;
}
