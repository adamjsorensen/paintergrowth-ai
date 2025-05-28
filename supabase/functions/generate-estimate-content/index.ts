
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client for database access
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Get active PDF summary prompt from database
const getEstimateContentPrompt = async (estimateData: any, projectType: string, lineItems: any[], totals: any) => {
  const { data, error } = await supabase
    .from('estimate_prompt_templates')
    .select('*')
    .eq('purpose', 'pdf_summary')
    .eq('active', true)
    .single();

  if (error || !data) {
    console.error('Error fetching PDF summary prompt:', error);
    throw new Error('No active PDF summary prompt found');
  }

  // Inject dynamic data into the prompt
  let processedPrompt = data.prompt_text;
  
  processedPrompt = processedPrompt.replace(/{projectType}/g, projectType);
  processedPrompt = processedPrompt.replace(/{estimateData}/g, JSON.stringify(estimateData, null, 2));
  processedPrompt = processedPrompt.replace(/{lineItems}/g, JSON.stringify(lineItems, null, 2));
  processedPrompt = processedPrompt.replace(/{totals}/g, JSON.stringify(totals, null, 2));

  return {
    prompt: processedPrompt,
    model: data.model,
    temperature: data.temperature
  };
};

// Call OpenRouter with the processed prompt
const callOpenRouter = async (prompt: string, model: string, temperature: number, openRouterApiKey: string) => {
  console.log('Calling OpenRouter with model:', model, 'temperature:', temperature);
  
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openRouterApiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://estimate-generator.app',
      'X-Title': 'Estimate Generator',
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'system',
          content: 'You are a professional painting contractor assistant that generates detailed, professional estimate documents. IMPORTANT: Return ONLY the JSON object without any markdown formatting, code blocks, or additional text. Do not wrap your response in ```json or ``` blocks.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: temperature,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  let generatedContent = data.choices[0].message.content;
  
  console.log('Generated content:', generatedContent);

  // Clean up markdown formatting if present
  if (generatedContent.startsWith('```json')) {
    generatedContent = generatedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (generatedContent.startsWith('```')) {
    generatedContent = generatedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  // Parse the JSON response
  try {
    return JSON.parse(generatedContent);
  } catch (parseError) {
    console.error('Failed to parse AI response as JSON:', generatedContent);
    console.error('Parse error:', parseError);
    
    // Fallback to basic structure if JSON parsing fails
    return {
      projectOverview: 'Professional interior painting services for your project.',
      scopeOfWork: 'Comprehensive painting services including surface preparation and professional application.',
      materialsAndLabor: 'High-quality paint and materials, professional labor included.',
      timeline: 'Project timeline to be determined based on scope.',
      termsAndConditions: 'Standard painting contract terms apply.',
      additionalNotes: 'Additional details to be discussed during project planning.'
    };
  }
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

    // Get prompt configuration from database
    const { prompt, model, temperature } = await getEstimateContentPrompt(estimateData, projectType, lineItems, totals);
    console.log('Using prompt from database with model:', model, 'temperature:', temperature);

    // Call OpenRouter with database-configured prompt
    const estimateContent = await callOpenRouter(prompt, model, temperature, OPENROUTER_API_KEY);

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
