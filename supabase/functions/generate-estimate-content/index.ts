
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
  totals: ${JSON.stringify(totals)}
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
    
    // Replace placeholders in the prompt
    Object.entries(promptData).forEach(([key, value]) => {
      fullPrompt = fullPrompt.replace(new RegExp(`{{${key}}}`, 'g'), value || '');
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
    const aiResponse = result.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from AI model');
    }

    let generatedContent;
    try {
      generatedContent = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      
      if (purpose === 'suggestion') {
        // Return empty suggestions array if parsing fails
        generatedContent = {
          suggestions: []
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
