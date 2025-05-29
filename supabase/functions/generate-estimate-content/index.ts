
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
    const { estimateData, projectType, lineItems, totals, purpose = 'pdf_summary', roomsMatrix, clientNotes } = body;

    console.log(`Generating estimate content for: {
  projectType: "${projectType}",
  purpose: "${purpose}",
  totals: ${JSON.stringify(totals)},
  lineItems: ${JSON.stringify(lineItems)}
}`);

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

    console.log(`Using prompt from database with model: ${promptTemplate.model} temperature: ${promptTemplate.temperature}`);

    // Build enhanced prompt data for suggestions
    const promptData = {
      projectType,
      estimateData: JSON.stringify(estimateData, null, 2),
      lineItems: JSON.stringify(lineItems, null, 2),
      totals: JSON.stringify(totals, null, 2),
      roomsMatrix: roomsMatrix ? JSON.stringify(roomsMatrix, null, 2) : 'Not provided',
      clientNotes: clientNotes || 'No additional client notes provided'
    };

    let fullPrompt = promptTemplate.prompt_text;
    
    // Replace placeholders in the prompt - handle both {{}} and {} formats
    Object.entries(promptData).forEach(([key, value]) => {
      fullPrompt = fullPrompt.replace(new RegExp(`{{${key}}}`, 'g'), value || '');
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
      
      if (purpose === 'suggestion') {
        // Create enhanced fallback suggestions with the new structure
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

    if (purpose === 'suggestion') {
      console.log('Generated suggestions:', generatedContent);
    } else {
      console.log('Generated content:', generatedContent);
    }

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

// Enhanced helper function to create contextual fallback suggestions with new structure
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
  
  // Add a general risk mitigation item
  suggestions.riskMitigation.push({
    id: 'scope-changes',
    risk: 'Mid-Project Scope Changes',
    description: 'Clients often request additional work or changes once the project begins.',
    solution: 'Establish clear change order procedures and pricing structure upfront, with written approval required for any scope modifications.',
    impact: 'medium'
  });
  
  return suggestions;
}
