import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// Securely fetch API key from Edge Function secrets
const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");

// Allow CORS for Supabase and browser-based usage
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle browser CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the incoming request body
    const { chunk } = await req.json();

    // Validate input
    if (!chunk || typeof chunk !== "string" || chunk.trim().length === 0) {
      throw new Error("Invalid or missing chunk content");
    }

    console.log("[Metadata] Received chunk (truncated):", chunk.slice(0, 500));

    // Construct prompt for Gemini model
    const prompt = `You're an assistant for document analysis. Given the following chunk of text, generate structured metadata in JSON format. The JSON should include:

- 'tags': 3–6 keywords or short descriptors
- 'summary': a 1–2 sentence summary of the content
- 'section_title': if relevant, a short title for the chunk

Respond with JSON only.

Text:
${chunk}`;

    // Call OpenRouter Gemini model
    const geminiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://lovable.ai",
        "X-Title": "Vector Upload Metadata Generator",
      },
      body: JSON.stringify({
        model: "google/gemini-2-flash",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    // Parse response JSON
    const result = await geminiRes.json();
    console.log("[Metadata] Gemini response status:", geminiRes.status);
    console.log("[Metadata] Gemini full response:", JSON.stringify(result, null, 2));

    if (!geminiRes.ok || !result.choices?.[0]?.message?.content) {
      throw new Error(result.error?.message || "Gemini did not return content");
    }

    const raw = result.choices[0].message.content;
    console.log("[Metadata] Gemini raw output:", raw);

    // Extract the JSON object (strip out non-JSON text if present)
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : raw;

    // Parse metadata safely
    const metadata = JSON.parse(jsonString);
    console.log("[Metadata] Parsed metadata JSON:", metadata);

    // Return metadata
    return new Response(
      JSON.stringify({ metadata }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[Metadata] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});