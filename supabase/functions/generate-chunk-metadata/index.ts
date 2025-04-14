
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");

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
    const { chunk } = await req.json();
    
    if (!chunk || typeof chunk !== 'string' || chunk.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid or missing chunk content' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Set up the prompt for Gemini
    const prompt = `You're an assistant for document analysis. Given the following chunk of text, generate structured metadata in JSON format. The JSON should include: 

- 'tags': 3-6 keywords or short descriptors
- 'summary': a 1-2 sentence summary of the content
- 'section_title': if relevant, a short title for the chunk

Respond with JSON only.

Text:
${chunk}`;

    // Call OpenRouter to access Gemini 2.0 Flash
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://lovable.ai",
        "X-Title": "Vector Upload Metadata Generator"
      },
      body: JSON.stringify({
        model: "google/gemini-2-flash",
        messages: [
          { role: "user", content: prompt }
        ]
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Error from OpenRouter:", result);
      return new Response(
        JSON.stringify({ error: result.error?.message || "Failed to generate metadata" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Extract the generated content
    const generatedContent = result.choices[0]?.message?.content;
    
    if (!generatedContent) {
      return new Response(
        JSON.stringify({ error: "No metadata generated" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse the JSON from the response
    try {
      // Extract JSON from the response (in case there's any wrapper text)
      const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : generatedContent;
      
      const metadata = JSON.parse(jsonString);
      
      return new Response(
        JSON.stringify({ metadata }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError, "Content:", generatedContent);
      return new Response(
        JSON.stringify({ 
          error: "Failed to parse metadata JSON", 
          rawContent: generatedContent 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
  } catch (error) {
    console.error("Error in generate-chunk-metadata function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
