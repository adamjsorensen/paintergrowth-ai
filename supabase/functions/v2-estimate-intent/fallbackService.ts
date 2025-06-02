
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

// Create a fallback response with proper 9-section PDF structure
export function createFallbackResponse(reason: string, corsHeaders: Record<string, string>) {
  console.log(`Creating fallback response due to: ${reason}`);
  
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
    projectOverview: "Thank you for considering our painting services for your project. This estimate provides a comprehensive overview of the proposed work.",
    scopeOfWork: "We will provide complete interior/exterior painting services including surface preparation, primer application, and finish coats using premium materials.",
    lineItems: [],
    addOns: [],
    pricing: {
      subtotal: 0,
      tax: 0,
      total: 0,
      taxRate: "0%"
    },
    termsAndConditions: "Standard terms and conditions apply. Payment schedule and warranty information will be provided with the final contract.",
    companyInfo: {
      name: "Your Company",
      address: "Company Address",
      phone: "(555) 123-4567",
      email: "contact@company.com"
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
