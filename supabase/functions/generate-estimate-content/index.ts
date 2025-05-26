
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { estimateData, projectType, lineItems, totals } = await req.json();
    
    console.log('Generating estimate content for:', { projectType, totals });

    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
    if (!OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY is not configured');
    }

    // Build a comprehensive prompt for estimate content generation
    const prompt = `You are a professional painting contractor creating a detailed estimate document. Generate comprehensive estimate content based on the following information:

PROJECT TYPE: ${projectType}
ESTIMATE DATA: ${JSON.stringify(estimateData, null, 2)}
LINE ITEMS: ${JSON.stringify(lineItems, null, 2)}
TOTALS: ${JSON.stringify(totals, null, 2)}

Generate a professional estimate document with the following sections:
1. PROJECT OVERVIEW - Brief description of the painting project
2. SCOPE OF WORK - Detailed description of what work will be performed
3. MATERIALS AND LABOR - Overview of materials and labor included
4. TIMELINE - Estimated project duration and schedule
5. TERMS AND CONDITIONS - Payment terms, warranty information, etc.
6. ADDITIONAL NOTES - Any special considerations or requirements

Make the content professional, detailed, and client-ready. Use clear, professional language appropriate for a painting contractor estimate.

Return the response as a JSON object with each section as a separate property:
{
  "projectOverview": "...",
  "scopeOfWork": "...",
  "materialsAndLabor": "...",
  "timeline": "...",
  "termsAndConditions": "...",
  "additionalNotes": "..."
}`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://estimate-generator.app',
        'X-Title': 'Estimate Generator',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a professional painting contractor assistant that generates detailed, professional estimate documents. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;
    
    console.log('Generated content:', generatedContent);

    // Parse the JSON response
    let estimateContent;
    try {
      estimateContent = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('Error parsing generated content:', parseError);
      // Fallback to basic structure if JSON parsing fails
      estimateContent = {
        projectOverview: generatedContent.substring(0, 500) + '...',
        scopeOfWork: 'Professional interior painting services as specified.',
        materialsAndLabor: 'High-quality paint and materials, professional labor included.',
        timeline: 'Project timeline to be determined based on scope.',
        termsAndConditions: 'Standard painting contract terms apply.',
        additionalNotes: 'Additional details to be discussed.'
      };
    }

    return new Response(JSON.stringify({ content: estimateContent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating estimate content:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
