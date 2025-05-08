import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transcript } = await req.json();
    
    if (!transcript) {
      return new Response(
        JSON.stringify({ error: 'No transcript provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get OpenRouter API key from environment
    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openRouterApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenRouter API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create the prompt for information extraction
    const prompt = `
You are an AI assistant for painting contractors. Your task is to extract relevant information from a transcript of a contractor walking through a property or discussing a project with a client.

Extract the following information:
1. Client information (name, email, phone, address)
2. Project details (type of project, timeline, budget)
3. Scope of work (rooms to be painted, surfaces, special requirements)
4. Any other relevant information

For each piece of information, provide:
- The extracted value
- A confidence score (0.0 to 1.0)
- The corresponding form field name (if applicable)

Respond with a JSON object with the following structure:
{
  "fields": [
    {
      "name": "Client Name",
      "value": "John Smith",
      "confidence": 0.95,
      "formField": "clientName"
    },
    {
      "name": "Project Address",
      "value": "123 Main St, Anytown, USA",
      "confidence": 0.85,
      "formField": "projectAddress"
    }
  ]
}

Here is the transcript:
${transcript}
`;

    // Call OpenRouter API (using GPT-4o Mini)
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openRouterApiKey}`,
        'HTTP-Referer': 'https://lovable.dev',
        'X-Title': 'Paintergrowth.ai'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenRouter API error:', errorData);
      return new Response(
        JSON.stringify({ error: `Information extraction failed: ${response.status} ${response.statusText}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      return new Response(
        JSON.stringify({ error: 'No content returned from AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the JSON response from the AI
    try {
      // Find JSON in the response (in case there's any wrapper text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : content;
      const extractedData = JSON.parse(jsonString);
      
      return new Response(
        JSON.stringify(extractedData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError, content);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to parse AI response', 
          rawContent: content 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in extract-information function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});