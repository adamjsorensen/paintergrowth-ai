
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
    const { estimateData, projectType, lineItems, totals, purpose = 'pdf_summary' } = body;

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

    // Build the prompt with the estimate data
    const promptData = {
      projectType,
      estimateData: JSON.stringify(estimateData, null, 2),
      lineItems: JSON.stringify(lineItems, null, 2),
      totals: JSON.stringify(totals, null, 2)
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
        // Create contextual fallback suggestions based on project type and available data
        const fallbackSuggestions = createFallbackSuggestions(projectType, estimateData, totals);
        generatedContent = {
          suggestions: fallbackSuggestions
        };
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

// Helper function to create contextual fallback suggestions
function createFallbackSuggestions(projectType: string, estimateData: any, totals: any) {
  const suggestions = [];
  
  if (projectType === 'interior') {
    suggestions.push({
      id: 'premium-prep',
      category: 'quality',
      title: 'Premium Surface Preparation',
      description: 'Upgrade to comprehensive surface preparation including detailed sanding, patching, and premium primer application for superior paint adhesion and longevity.',
      impact: 'high',
      estimatedValue: 450
    });
    
    suggestions.push({
      id: 'paint-upgrade',
      category: 'upsell',
      title: 'High-End Paint Selection',
      description: 'Consider premium paint brands with superior coverage, durability, and color retention. Especially beneficial for high-traffic areas.',
      impact: 'medium',
      estimatedValue: 300
    });
    
    suggestions.push({
      id: 'trim-detail',
      category: 'upsell',
      title: 'Detailed Trim Work',
      description: 'Add precision trim painting with brush work for crisp, clean lines that enhance the overall finish quality.',
      impact: 'medium',
      estimatedValue: 250
    });
  } else {
    suggestions.push({
      id: 'weather-protection',
      category: 'quality',
      title: 'Weather-Resistant Coating',
      description: 'Upgrade to premium weather-resistant paint formulations designed to withstand harsh outdoor conditions and UV exposure.',
      impact: 'high',
      estimatedValue: 500
    });
    
    suggestions.push({
      id: 'power-washing',
      category: 'preparation',
      title: 'Professional Power Washing',
      description: 'Include thorough power washing service to ensure optimal paint adhesion and remove all dirt, mildew, and chalking.',
      impact: 'high',
      estimatedValue: 350
    });
  }
  
  // Add a maintenance suggestion
  suggestions.push({
    id: 'maintenance-plan',
    category: 'service',
    title: 'Annual Touch-Up Service',
    description: 'Schedule annual inspection and touch-up service to maintain the paint finish and extend its lifespan.',
    impact: 'low',
    estimatedValue: 150
  });
  
  return suggestions;
}
