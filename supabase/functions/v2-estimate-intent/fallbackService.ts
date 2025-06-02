
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

// Create a fallback response with dummy PDF data
export function createFallbackResponse(reason: string, corsHeaders: Record<string, string>) {
  console.log(`Creating fallback response due to: ${reason}`);
  
  const fallbackContent = {
    projectOverview: "Thank you for considering our painting services for your project. This estimate provides a comprehensive overview of the proposed work.",
    scopeOfWork: "We will provide complete interior/exterior painting services including surface preparation, primer application, and finish coats using premium materials.",
    materialsAndLabor: "All materials and labor are included in this estimate. We use high-quality paints and professional-grade tools to ensure lasting results.",
    timeline: "Project timeline will be discussed and agreed upon before work begins, taking into account weather conditions and project complexity.",
    termsAndConditions: "Standard terms and conditions apply. Payment schedule and warranty information will be provided with the final contract.",
    additionalNotes: "Please contact us if you have any questions about this estimate or would like to discuss any modifications to the scope of work."
  };

  return new Response(
    JSON.stringify(fallbackContent),
    { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}
