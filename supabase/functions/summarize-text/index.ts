import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Define CORS headers directly in this file
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Consider restricting to your frontend's URL in production
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Gemini 2.0 Flash model ID for OpenRouter
const OPENROUTER_MODEL_ID = "google/gemini-2.5-flash-preview-05-20";

// Define a default prompt for extracting painting estimate details
const DEFAULT_SUMMARIZATION_PROMPT = `
You are an expert summarization assistant. Based on the following transcript of a conversation with a painting contractor,
extract all key details relevant for creating a painting estimate. Focus on:
- Client name and contact information (if mentioned)
- Project address (if mentioned)
- Scope of work:
    - Interior/Exterior
    - Specific rooms or areas to be painted (e.g., living room, kitchen cabinets, exterior siding)
    - Surfaces to be painted (e.g., walls, ceilings, trim, doors, fences)
    - Number of coats, specific paint types or colors if mentioned
    - Any prep work mentioned (e.g., drywall repair, power washing, scraping)
    - Dimensions or sizes if provided
    - Any specific customer requests, concerns, or deadlines.
Present the summary as a concise list of bullet points or a short paragraph covering these details.
If some details are missing, do not invent them.
Transcript:
"""
{transcript}
"""
Summary:
`;

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { transcript } = await req.json();

    if (!transcript) {
      return new Response(JSON.stringify({ error: "Missing transcript" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const openRouterApiKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!openRouterApiKey) {
      console.error("OPENROUTER_API_KEY is not set in environment variables.");
      return new Response(JSON.stringify({ error: "OpenRouter API key not configured" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const prompt = DEFAULT_SUMMARIZATION_PROMPT.replace("{transcript}", transcript);

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterApiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://paintergrowth-ai.vercel.app", // Change this to your actual domain
        "X-Title": "PainterGrowth AI" // Your application name
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL_ID,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000, 
        temperature: 0.3, // Lower temperature for more consistent output
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`OpenRouter API error: ${response.status} ${errorBody}`);
      return new Response(JSON.stringify({ error: `Failed to get summary from OpenRouter: ${errorBody}` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: response.status,
      });
    }

    const data = await response.json();
    const summary = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content
      ? data.choices[0].message.content.trim()
      : "Summary could not be extracted.";

    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in summarize-text function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
})
