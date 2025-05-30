import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const body = await req.json();
    const { 
      estimateData, 
      projectType, 
      lineItems, 
      totals, 
      purpose = 'pdf_summary', 
      roomsMatrix, 
      clientNotes,
      companyProfile,
      clientInfo,
      taxRate,
      addOns
    } = body;

    console.log(`Generating content for purpose: ${purpose}`);

    // Get the appropriate prompt template based on purpose
    const { data: promptTemplate, error: promptError } = await supabaseClient
      .from('estimate_prompt_templates')
      .select('*')
      .eq('purpose', purpose)
      .eq('active', true)
      .single();

    if (promptError || !promptTemplate) {
      console.error('No active prompt template found for purpose:', purpose);
      return new Response(
        JSON.stringify({ error: `No active prompt template found for ${purpose}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Using prompt template: ${promptTemplate.name} with model: ${promptTemplate.model}`);

    // Enhanced data preparation for PDF generation
    const enhancedData = {
      estimateData: JSON.stringify(estimateData, null, 2),
      projectType,
      lineItems: JSON.stringify(lineItems, null, 2),
      totals: JSON.stringify(totals, null, 2),
      roomsMatrix: roomsMatrix ? JSON.stringify(roomsMatrix, null, 2) : 'Not provided',
      clientNotes: clientNotes || 'No additional client notes provided',
      companyProfile: companyProfile ? JSON.stringify(companyProfile, null, 2) : 'Company profile not provided',
      clientInfo: clientInfo ? JSON.stringify(clientInfo, null, 2) : 'Client information not provided',
      taxRate: taxRate || '0%',
      addOns: addOns ? JSON.stringify(addOns, null, 2) : 'No add-ons provided'
    };

    let fullPrompt = promptTemplate.prompt_text;
    
    // Replace placeholders in the prompt
    Object.entries(enhancedData).forEach(([key, value]) => {
      fullPrompt = fullPrompt.replace(new RegExp(`{${key}}`, 'g'), value || '');
    });

    console.log(`Calling OpenRouter with model: ${promptTemplate.model} temperature: ${promptTemplate.temperature}`);

    // Call OpenRouter API
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENROUTER_API_KEY')}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://supabase.com',
        'X-Title': 'Estimate Generator'
      },
      body: JSON.stringify({
        model: promptTemplate.model,
        messages: [
          {
            role: 'user',
            content: fullPrompt
          }
        ],
        temperature: promptTemplate.temperature
      })
    });

    if (!openRouterResponse.ok) {
      throw new Error(`OpenRouter API error: ${openRouterResponse.statusText}`);
    }

    const result = await openRouterResponse.json();
    let aiResponse = result.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from AI model');
    }

    // Clean the AI response by removing markdown code blocks
    aiResponse = aiResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    
    let generatedContent;
    try {
      generatedContent = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('Raw AI response:', aiResponse);
      
      if (purpose === 'pdf_generation') {
        // Create structured fallback for PDF generation
        generatedContent = createPdfFallback(projectType, estimateData, totals, lineItems, companyProfile, clientInfo);
      } else if (purpose === 'suggestion') {
        // Keep existing fallback for suggestions
        const fallbackSuggestions = createEnhancedFallbackSuggestions(projectType, estimateData, totals, lineItems);
        generatedContent = fallbackSuggestions;
      } else {
        // Return a structured response for content generation even if parsing fails
        generatedContent = {
          projectOverview: aiResponse.substring(0, 500) + '...',
          scopeOfWork: 'Generated content could not be parsed properly.',
          materialsAndLabor: '',
          timeline: '',
          termsAndConditions: '',
          additionalNotes: ''
        };
      }
    }

    console.log(`Generated ${purpose} content successfully`);

    return new Response(
      JSON.stringify(generatedContent),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-estimate-content function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Fallback function for PDF generation
function createPdfFallback(projectType: string, estimateData: any, totals: any, lineItems: any, companyProfile: any, clientInfo: any) {
  const currentDate = new Date();
  const estimateNumber = `EST-${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}${String(currentDate.getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`;
  
  return {
    coverPage: {
      title: "Professional Painting Estimate",
      clientName: clientInfo?.name || estimateData?.clientName || "Valued Client",
      projectAddress: clientInfo?.address || estimateData?.address || "Project Address",
      estimateDate: currentDate.toLocaleDateString('en-US'),
      estimateNumber: estimateNumber,
      validUntil: new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US')
    },
    projectOverview: {
      description: `This estimate covers a comprehensive ${projectType} painting project with professional preparation, premium materials, and expert application.`,
      projectType: projectType,
      totalRooms: lineItems?.length || 0,
      keyFeatures: ["Professional surface preparation", "Premium paint application", "Quality assurance inspection"]
    },
    scopeOfWork: {
      preparation: ["Surface cleaning and preparation", "Primer application where needed", "Protection of surrounding areas"],
      painting: lineItems?.map((item: any) => item.description) || ["Interior/exterior painting as specified"],
      cleanup: ["Daily cleanup", "Final walkthrough", "Debris removal"],
      timeline: "Project completion within agreed timeframe"
    },
    lineItems: {
      items: lineItems || [],
      subtotal: totals?.subtotal || totals?.total || 0,
      notes: "All materials and labor included"
    },
    addOns: {
      available: [],
      recommended: ["Premium paint upgrade", "Additional surface preparation", "Trim and accent work"],
      pricing: "Available upon request"
    },
    pricing: {
      subtotal: totals?.subtotal || totals?.total || 0,
      tax: totals?.tax || 0,
      total: totals?.grandTotal || totals?.total || 0,
      paymentTerms: "50% deposit required, balance due upon completion"
    },
    termsAndConditions: {
      warranty: "1-year warranty on workmanship covering defects in application",
      materials: "Premium quality paints and materials from trusted suppliers",
      scheduling: "Work scheduled according to agreed timeline with weather considerations",
      changes: "Any changes to scope require written approval and may affect pricing"
    },
    companyInfo: {
      businessName: companyProfile?.business_name || companyProfile?.businessName || "Professional Painting Services",
      contactInfo: `Phone: ${companyProfile?.phone || "Contact for phone"} | Email: ${companyProfile?.email || "Contact for email"}`,
      license: companyProfile?.license || "Licensed and insured",
      insurance: "Fully insured for your protection"
    },
    signatures: {
      contractorSignature: "_____________________ Date: _______",
      clientSignature: "_____________________ Date: _______",
      acceptanceText: "By signing below, client accepts this estimate and authorizes work to begin."
    }
  };
}

// Keep existing enhanced fallback suggestions function
function createEnhancedFallbackSuggestions(projectType: string, estimateData: any, totals: any, lineItems: any) {
  const suggestions = {
    upsellRecommendations: [],
    missingScope: [],
    riskMitigation: []
  };
  
  if (projectType === 'interior') {
    suggestions.upsellRecommendations.push(
      {
        id: 'premium-prep',
        title: 'Premium Surface Preparation',
        description: 'Upgrade to comprehensive surface preparation including detailed sanding, patching, and premium primer application for superior paint adhesion and longevity.',
        estimatedPrice: 450,
        reasoning: 'Enhanced surface prep significantly improves paint durability and finish quality, especially important for high-traffic interior areas.'
      },
      {
        id: 'paint-upgrade',
        title: 'High-End Paint Selection',
        description: 'Consider premium paint brands with superior coverage, durability, and color retention. Especially beneficial for high-traffic areas.',
        estimatedPrice: 300,
        reasoning: 'Premium paints offer better coverage, require fewer coats, and provide longer-lasting results, making them cost-effective over time.'
      }
    );
    
    suggestions.missingScope.push({
      id: 'ceiling-check',
      item: 'Ceiling Assessment',
      description: 'Project mentions rooms but ceiling painting requirements not clearly specified.',
      impact: 'medium'
    });
    
    suggestions.riskMitigation.push({
      id: 'furniture-protection',
      risk: 'Furniture and Flooring Damage',
      description: 'Interior painting projects risk damage to client belongings and flooring.',
      solution: 'Include comprehensive protection protocols with plastic sheeting, drop cloths, and furniture moving services.',
      impact: 'high'
    });
  } else {
    suggestions.upsellRecommendations.push(
      {
        id: 'weather-protection',
        title: 'Weather-Resistant Coating',
        description: 'Upgrade to premium weather-resistant paint formulations designed to withstand harsh outdoor conditions and UV exposure.',
        estimatedPrice: 500,
        reasoning: 'Weather-resistant coatings provide superior protection against elements, extending paint life and reducing maintenance needs.'
      },
      {
        id: 'power-washing',
        title: 'Professional Power Washing',
        description: 'Include thorough power washing service to ensure optimal paint adhesion and remove all dirt, mildew, and chalking.',
        estimatedPrice: 350,
        reasoning: 'Proper surface preparation through power washing is critical for exterior paint longevity and warranty compliance.'
      }
    );
    
    suggestions.missingScope.push({
      id: 'trim-detail',
      item: 'Trim and Accent Details',
      description: 'Exterior projects often overlook window trim, shutters, and architectural details that may need attention.',
      impact: 'medium'
    });
    
    suggestions.riskMitigation.push({
      id: 'weather-delays',
      risk: 'Weather-Related Delays',
      description: 'Exterior painting is highly dependent on weather conditions, which can cause significant project delays.',
      solution: 'Build weather contingency into timeline and establish clear communication protocols for weather-related schedule changes.',
      impact: 'high'
    });
  }
  
  suggestions.riskMitigation.push({
    id: 'scope-changes',
    risk: 'Mid-Project Scope Changes',
    description: 'Clients often request additional work or changes once the project begins.',
    solution: 'Establish clear change order procedures and pricing structure upfront, with written approval required for any scope modifications.',
    impact: 'medium'
  });
  
  return suggestions;
}
