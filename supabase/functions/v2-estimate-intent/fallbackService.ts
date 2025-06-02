// Default boilerplate content
export function getDefaultBoilerplate() {
  return {
    introduction: 'Thank you for considering our painting services for your project.',
    powerWashing: 'We will thoroughly clean all surfaces to ensure proper paint adhesion.',
    surfacePreparation: 'All surfaces will be properly prepared including scraping, sanding, and priming as needed.',
    paintApplication: 'We use only high-quality paints and materials for lasting results.',
    safetyAndCleanup: 'We maintain a clean and safe work environment throughout the project.',
    specialConsiderations: 'Please note any special requirements or concerns for this project.'
  };
}

// Enhanced fallback response with better structure
export function createFallbackResponse(reason: string, corsHeaders: Record<string, string>) {
  console.log(`Creating enhanced fallback response due to: ${reason}`);
  
  const fallbackContent = {
    coverPage: {
      estimateDate: new Date().toLocaleDateString(),
      estimateNumber: `EST-${Date.now()}`,
      proposalNumber: `PROP-${Date.now()}`,
      clientName: "Valued Client",
      clientPhone: "",
      clientEmail: "",
      projectAddress: "Project Address",
      estimatorName: "Project Estimator",
      estimatorEmail: "estimator@company.com",
      estimatorPhone: "(555) 123-4567"
    },
    projectOverview: "Thank you for considering our painting services for your project. This estimate provides a comprehensive overview of the proposed work using our professional approach and high-quality materials.",
    scopeOfWork: "We will provide complete painting services including thorough surface preparation, primer application where needed, and professional application of premium paint. All work will be completed to industry standards with attention to detail and comprehensive cleanup.",
    lineItems: [],
    addOns: [],
    pricing: {
      subtotal: 0,
      tax: 0,
      total: 0,
      taxRate: "0%"
    },
    termsAndConditions: "Standard terms and conditions apply. Payment in full is due upon completion of work. All invoices not paid in full after 15 days will be subject to a 2% per month interest charge. We provide a comprehensive warranty on all work performed.",
    companyInfo: {
      name: "Your Company",
      address: "Company Address",
      phone: "(555) 123-4567",
      email: "contact@company.com",
      website: ""
    },
    signatures: {
      clientSignatureRequired: true,
      warrantyInfo: "We provide a comprehensive warranty on all work performed. Details will be provided in the final contract."
    }
  };

  return new Response(
    JSON.stringify(fallbackContent),
    { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

// Section-specific fallback functions for granular recovery
export function createSectionFallback(sectionName: string, fallbackData: any): any {
  switch (sectionName) {
    case 'projectOverview':
      return `Thank you for considering our painting services for your ${fallbackData.projectType || 'painting'} project. This estimate outlines our professional approach to delivering high-quality results.`;
    
    case 'scopeOfWork':
      return `We will provide complete ${fallbackData.projectType || 'interior/exterior'} painting services including surface preparation, primer application, and professional paint application using premium materials.`;
    
    case 'termsAndConditions':
      return 'Standard terms and conditions apply. Payment in full is due upon completion. We provide warranty coverage on all work performed.';
    
    case 'warrantyInfo':
      return 'We provide a comprehensive warranty on all painting work. Complete warranty terms will be provided in the final contract.';
    
    default:
      return null;
  }
}
