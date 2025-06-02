
import { PDFContentSchema, type PDFContent } from "./schemas.ts";

export interface ValidationResult {
  isValid: boolean;
  content: PDFContent;
  errors: string[];
  fixedSections: string[];
}

export function validateAndFixContent(
  rawContent: any,
  fallbackData: any
): ValidationResult {
  const errors: string[] = [];
  const fixedSections: string[] = [];
  
  // Start with the raw content and fix section by section
  const content: PDFContent = {
    coverPage: validateCoverPage(rawContent.coverPage, fallbackData, errors, fixedSections),
    projectOverview: validateProjectOverview(rawContent.projectOverview, fallbackData, errors, fixedSections),
    scopeOfWork: validateScopeOfWork(rawContent.scopeOfWork, fallbackData, errors, fixedSections),
    lineItems: validateLineItems(rawContent.lineItems, fallbackData, errors, fixedSections),
    addOns: validateAddOns(rawContent.addOns, fallbackData, errors, fixedSections),
    pricing: validatePricing(rawContent.pricing, fallbackData, errors, fixedSections),
    termsAndConditions: validateTermsAndConditions(rawContent.termsAndConditions, fallbackData, errors, fixedSections),
    companyInfo: validateCompanyInfo(rawContent.companyInfo, fallbackData, errors, fixedSections),
    signatures: validateSignatures(rawContent.signatures, fallbackData, errors, fixedSections)
  };

  // Try final validation with Zod
  const zodResult = PDFContentSchema.safeParse(content);
  
  return {
    isValid: zodResult.success,
    content,
    errors: zodResult.success ? errors : [...errors, ...zodResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`)],
    fixedSections
  };
}

function validateCoverPage(coverPage: any, fallbackData: any, errors: string[], fixedSections: string[]) {
  if (!coverPage || typeof coverPage !== 'object') {
    errors.push('Invalid cover page structure');
    fixedSections.push('coverPage');
    return createFallbackCoverPage(fallbackData);
  }

  return {
    estimateDate: coverPage.estimateDate || fallbackData.estimateDate || new Date().toLocaleDateString(),
    estimateNumber: coverPage.estimateNumber || fallbackData.estimateNumber || `EST-${Date.now()}`,
    proposalNumber: coverPage.proposalNumber || fallbackData.proposalNumber || `PROP-${Date.now()}`,
    clientName: coverPage.clientName || fallbackData.clientName || 'Valued Client',
    clientPhone: coverPage.clientPhone || fallbackData.clientPhone || '',
    clientEmail: coverPage.clientEmail || fallbackData.clientEmail || '',
    projectAddress: coverPage.projectAddress || fallbackData.projectAddress || 'Project Address',
    estimatorName: coverPage.estimatorName || fallbackData.estimatorName || 'Project Estimator',
    estimatorEmail: coverPage.estimatorEmail || fallbackData.estimatorEmail || 'estimator@company.com',
    estimatorPhone: coverPage.estimatorPhone || fallbackData.estimatorPhone || '(555) 123-4567'
  };
}

function validateProjectOverview(projectOverview: any, fallbackData: any, errors: string[], fixedSections: string[]) {
  if (!projectOverview || typeof projectOverview !== 'string') {
    errors.push('Invalid project overview');
    fixedSections.push('projectOverview');
    return createFallbackProjectOverview(fallbackData);
  }
  return projectOverview;
}

function validateScopeOfWork(scopeOfWork: any, fallbackData: any, errors: string[], fixedSections: string[]) {
  if (!scopeOfWork || typeof scopeOfWork !== 'string') {
    errors.push('Invalid scope of work');
    fixedSections.push('scopeOfWork');
    return createFallbackScopeOfWork(fallbackData);
  }
  return scopeOfWork;
}

function validateLineItems(lineItems: any, fallbackData: any, errors: string[], fixedSections: string[]) {
  if (!Array.isArray(lineItems)) {
    errors.push('Invalid line items structure');
    fixedSections.push('lineItems');
    return fallbackData.lineItems || [];
  }
  
  return lineItems.map(item => ({
    description: item.description || 'Line item',
    quantity: typeof item.quantity === 'number' ? item.quantity : 1,
    unit: item.unit || 'each',
    unitPrice: typeof item.unitPrice === 'number' ? item.unitPrice : 0,
    total: typeof item.total === 'number' ? item.total : 0
  }));
}

function validateAddOns(addOns: any, fallbackData: any, errors: string[], fixedSections: string[]) {
  if (!Array.isArray(addOns)) {
    errors.push('Invalid add-ons structure');
    fixedSections.push('addOns');
    return fallbackData.addOns || [];
  }
  
  return addOns.map(addon => ({
    description: addon.description || 'Add-on service',
    price: typeof addon.price === 'number' ? addon.price : 0,
    selected: typeof addon.selected === 'boolean' ? addon.selected : false
  }));
}

function validatePricing(pricing: any, fallbackData: any, errors: string[], fixedSections: string[]) {
  if (!pricing || typeof pricing !== 'object') {
    errors.push('Invalid pricing structure');
    fixedSections.push('pricing');
    return createFallbackPricing(fallbackData);
  }

  return {
    subtotal: typeof pricing.subtotal === 'number' ? pricing.subtotal : fallbackData.subtotal || 0,
    tax: typeof pricing.tax === 'number' ? pricing.tax : fallbackData.tax || 0,
    total: typeof pricing.total === 'number' ? pricing.total : fallbackData.total || 0,
    taxRate: pricing.taxRate || fallbackData.taxRate || '0%'
  };
}

function validateTermsAndConditions(termsAndConditions: any, fallbackData: any, errors: string[], fixedSections: string[]) {
  if (!termsAndConditions || typeof termsAndConditions !== 'string') {
    errors.push('Invalid terms and conditions');
    fixedSections.push('termsAndConditions');
    return createFallbackTermsAndConditions(fallbackData);
  }
  return termsAndConditions;
}

function validateCompanyInfo(companyInfo: any, fallbackData: any, errors: string[], fixedSections: string[]) {
  if (!companyInfo || typeof companyInfo !== 'object') {
    errors.push('Invalid company info structure');
    fixedSections.push('companyInfo');
    return createFallbackCompanyInfo(fallbackData);
  }

  return {
    name: companyInfo.name || fallbackData.companyName || 'Your Company',
    address: companyInfo.address || fallbackData.companyAddress || 'Company Address',
    phone: companyInfo.phone || fallbackData.estimatorPhone || '(555) 123-4567',
    email: companyInfo.email || fallbackData.estimatorEmail || 'contact@company.com',
    website: companyInfo.website || ''
  };
}

function validateSignatures(signatures: any, fallbackData: any, errors: string[], fixedSections: string[]) {
  if (!signatures || typeof signatures !== 'object') {
    errors.push('Invalid signatures structure');
    fixedSections.push('signatures');
    return createFallbackSignatures(fallbackData);
  }

  return {
    clientSignatureRequired: typeof signatures.clientSignatureRequired === 'boolean' ? signatures.clientSignatureRequired : true,
    warrantyInfo: signatures.warrantyInfo || createFallbackWarrantyInfo(fallbackData)
  };
}

// Fallback creation functions
function createFallbackCoverPage(fallbackData: any) {
  return {
    estimateDate: fallbackData.estimateDate || new Date().toLocaleDateString(),
    estimateNumber: fallbackData.estimateNumber || `EST-${Date.now()}`,
    proposalNumber: fallbackData.proposalNumber || `PROP-${Date.now()}`,
    clientName: fallbackData.clientName || 'Valued Client',
    clientPhone: fallbackData.clientPhone || '',
    clientEmail: fallbackData.clientEmail || '',
    projectAddress: fallbackData.projectAddress || 'Project Address',
    estimatorName: fallbackData.estimatorName || 'Project Estimator',
    estimatorEmail: fallbackData.estimatorEmail || 'estimator@company.com',
    estimatorPhone: fallbackData.estimatorPhone || '(555) 123-4567'
  };
}

function createFallbackProjectOverview(fallbackData: any) {
  return `Thank you for considering our painting services for your ${fallbackData.projectType || 'painting'} project at ${fallbackData.projectAddress || 'your property'}. This comprehensive estimate outlines our professional approach to transforming your space with high-quality materials and expert craftsmanship.`;
}

function createFallbackScopeOfWork(fallbackData: any) {
  const surfaces = Array.isArray(fallbackData.surfacesToPaint) ? fallbackData.surfacesToPaint.join(', ') : 'all specified surfaces';
  const prep = Array.isArray(fallbackData.prepNeeds) && fallbackData.prepNeeds.length > 0 
    ? `including ${fallbackData.prepNeeds.join(', ')}` 
    : 'including surface preparation as needed';
    
  return `We will provide complete ${fallbackData.projectType || 'interior/exterior'} painting services for ${surfaces}. Our work includes thorough surface preparation ${prep}, application of premium primer where needed, and professional application of high-quality paint. All work will be completed to industry standards with attention to detail and cleanup.`;
}

function createFallbackPricing(fallbackData: any) {
  return {
    subtotal: fallbackData.subtotal || 0,
    tax: fallbackData.tax || 0,
    total: fallbackData.total || 0,
    taxRate: fallbackData.taxRate || '0%'
  };
}

function createFallbackTermsAndConditions(fallbackData: any) {
  return `Standard terms and conditions apply to this estimate. Payment in full is due upon completion of work. All invoices not paid in full after 15 days will be subject to a 2% per month interest charge. We provide a comprehensive warranty on all work performed. Warranty details and payment schedule will be provided in the final contract.`;
}

function createFallbackCompanyInfo(fallbackData: any) {
  return {
    name: fallbackData.companyName || 'Your Company',
    address: fallbackData.companyAddress || 'Company Address',
    phone: fallbackData.estimatorPhone || '(555) 123-4567',
    email: fallbackData.estimatorEmail || 'contact@company.com',
    website: ''
  };
}

function createFallbackSignatures(fallbackData: any) {
  return {
    clientSignatureRequired: true,
    warrantyInfo: createFallbackWarrantyInfo(fallbackData)
  };
}

function createFallbackWarrantyInfo(fallbackData: any) {
  return `We provide a comprehensive warranty on all painting work performed. Our warranty covers materials and workmanship to ensure your satisfaction. Complete warranty terms will be provided in the final contract.`;
}
