
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
  if (!openRouterApiKey) {
    return new Response(
      JSON.stringify({ error: 'OpenRouter API key not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { prompt_id, field_values } = await req.json();
    
    if (!prompt_id) {
      return new Response(
        JSON.stringify({ error: 'Missing prompt_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch the prompt template
    const { data: promptTemplate, error: promptError } = await supabase
      .from('prompt_templates')
      .select('*')
      .eq('id', prompt_id)
      .single();
    
    if (promptError || !promptTemplate) {
      console.error('Error fetching prompt template:', promptError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch prompt template' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process the system prompt - replace all {{field_key}} with actual values
    let systemPrompt = promptTemplate.system_prompt;
    Object.entries(field_values).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      systemPrompt = systemPrompt.replace(regex, String(value));
    });

    console.log('Processed system prompt:', systemPrompt);

    // Call OpenRouter API
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openRouterApiKey}`,
        'HTTP-Referer': 'https://lovable.dev', // Replace with your actual domain
        'X-Title': 'Proposal Generator'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Generate a detailed proposal based on the information provided.' }
        ],
        temperature: 0.7,
        max_tokens: 1500
      }),
    });

    if (!openRouterResponse.ok) {
      const errorData = await openRouterResponse.text();
      console.error('OpenRouter API error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to generate content from OpenRouter' }),
        { status: openRouterResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await openRouterResponse.json();
    const generatedContent = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ content: generatedContent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in generate_proposal function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
