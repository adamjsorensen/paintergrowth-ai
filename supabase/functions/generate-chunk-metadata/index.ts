
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-debug',
};

// Debug logging helper functions
const debugLog = {
  isDebugMode: (req: Request): boolean => {
    // Check for debug mode via URL param, header, or request body
    const url = new URL(req.url);
    const debugParam = url.searchParams.get('debug');
    const debugHeader = req.headers.get('x-debug');
    
    return debugParam === 'true' || debugHeader === 'true';
  },

  log: (isDebug: boolean, type: string, message: string, details?: any): void => {
    if (isDebug) {
      console.log(`🔍 [${type}]: ${message}`);
      if (details) console.log(details);
    }
  },

  prompt: (isDebug: boolean, prompt: string): void => {
    if (isDebug) {
      console.log('🔍 Prompt sent to OpenRouter:');
      console.log(prompt);
    }
  },

  response: (isDebug: boolean, status: number, headers: Headers, body: any): void => {
    if (isDebug) {
      console.log('📨 Response from OpenRouter:');
      console.log(`status: ${status}`);
      console.log('headers:', Object.fromEntries(headers.entries()));
      console.log('body:', body);
    }
  },

  error: (isDebug: boolean, message: string, details?: any): void => {
    if (isDebug) {
      console.error(`❌ ${message}:`);
      if (details) console.error(details);
    }
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const reqData = await req.json();
    const { chunk, debug } = reqData;
    
    // Determine if we're in debug mode from any source
    const isDebugMode = debug === true || debugLog.isDebugMode(req);
    
    debugLog.log(isDebugMode, "REQUEST", "Processing chunk metadata request", { 
      chunkPreview: chunk ? chunk.substring(0, 100) + (chunk?.length > 100 ? '...' : '') : null,
      debugMode: isDebugMode
    });
    
    if (!chunk || typeof chunk !== 'string' || chunk.trim().length === 0) {
      if (isDebugMode) {
        debugLog.error(isDebugMode, 'Invalid input', { chunk: chunk?.substring(0, 100) + (chunk?.length > 100 ? '...' : '') });
      }
      
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

    // Log the prompt if in debug mode
    debugLog.prompt(isDebugMode, prompt);

    // Call OpenRouter to access Gemini 2.0 Flash
    let openRouterResponse;
    let responseData;
    
    try {
      debugLog.log(isDebugMode, "API_CALL", "Calling OpenRouter API", {
        model: "google/gemini-2.0-flash-001",
        contentLength: chunk.length
      });
      
      openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://lovable.ai",
          "X-Title": "Vector Upload Metadata Generator"
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-001",
          messages: [
            { role: "user", content: prompt }
          ]
        })
      });

      responseData = await openRouterResponse.json();
      
      // Log the full response in debug mode
      if (isDebugMode) {
        debugLog.response(isDebugMode, 
                          openRouterResponse.status, 
                          openRouterResponse.headers, 
                          responseData);
      }
    } catch (fetchError) {
      debugLog.error(isDebugMode, 'OpenRouter Fetch Error', fetchError);
      
      return new Response(
        JSON.stringify({ error: 'Failed to connect to OpenRouter' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!openRouterResponse.ok) {
      debugLog.error(isDebugMode, 'Error from OpenRouter', {
        status: openRouterResponse.status,
        statusText: openRouterResponse.statusText,
        result: responseData
      });
      
      return new Response(
        JSON.stringify({ error: responseData.error?.message || "Failed to generate metadata" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Extract the generated content
    const generatedContent = responseData.choices[0]?.message?.content;
    
    if (!generatedContent) {
      debugLog.error(isDebugMode, 'No content in response', responseData);
      
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
      
      debugLog.log(isDebugMode, "PARSING", 'Attempting to parse JSON:', jsonString);
      
      const metadata = JSON.parse(jsonString);
      
      debugLog.log(isDebugMode, "SUCCESS", 'Metadata generated successfully', metadata);
      
      return new Response(
        JSON.stringify({ metadata }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (parseError) {
      debugLog.error(
        isDebugMode, 
        'JSON Parse Error', 
        {
          error: parseError.message,
          rawContent: generatedContent,
          extractedJsonString: generatedContent.match(/\{[\s\S]*\}/)?.[0] || 'No JSON pattern found'
        }
      );
      
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
    const isDebugMode = debugLog.isDebugMode(req);
    debugLog.error(isDebugMode, 'General function error', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
