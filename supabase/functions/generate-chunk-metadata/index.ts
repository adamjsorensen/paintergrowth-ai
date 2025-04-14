
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-debug',
};

// Enhanced debug logging helper functions
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
  // More aggressive logging - this always runs regardless of debug mode
  console.log('🔄 Function invoked: generate-chunk-metadata');
  console.log('API Key present:', !!OPENROUTER_API_KEY);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('📝 Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📥 Processing request...');
    const reqData = await req.json();
    console.log('Request data type:', typeof reqData);
    console.log('Request data keys:', Object.keys(reqData || {}));
    
    const { chunk, debug } = reqData;
    
    // Determine if we're in debug mode from any source
    const isDebugMode = debug === true || debugLog.isDebugMode(req);
    console.log('Debug mode enabled:', isDebugMode);
    
    debugLog.log(isDebugMode, "REQUEST", "Processing chunk metadata request", { 
      chunkPreview: chunk ? chunk.substring(0, 100) + (chunk?.length > 100 ? '...' : '') : null,
      debugMode: isDebugMode
    });
    
    if (!chunk || typeof chunk !== 'string' || chunk.trim().length === 0) {
      console.error('❌ Invalid input - chunk is empty or not a string');
      console.log('Chunk value:', chunk);
      
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

    // Validate API key before attempting the call
    if (!OPENROUTER_API_KEY) {
      console.error('❌ CRITICAL ERROR: OpenRouter API key is missing!');
      
      return new Response(
        JSON.stringify({ error: 'OpenRouter API key is not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Call OpenRouter to access Gemini 2.0 Flash
    let openRouterResponse;
    let responseData;
    
    try {
      console.log('🌐 Sending request to OpenRouter API');
      debugLog.log(isDebugMode, "API_CALL", "Calling OpenRouter API", {
        model: "google/gemini-2.0-flash-001",
        contentLength: chunk.length
      });

      // Prepare the request body
      const requestBody = JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages: [
          { role: "user", content: prompt }
        ]
      });
      
      // Log the request
      console.log('📤 OpenRouter request body preview:', 
                 requestBody.substring(0, 200) + '...');
      
      openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://lovable.ai",
          "X-Title": "Vector Upload Metadata Generator"
        },
        body: requestBody
      });

      console.log('📥 OpenRouter response status:', openRouterResponse.status);
      console.log('📥 OpenRouter response status text:', openRouterResponse.statusText);
      
      // Clone the response to read it as text first for logging
      const responseClone = openRouterResponse.clone();
      const responseText = await responseClone.text();
      console.log('📥 OpenRouter raw response:', responseText.substring(0, 500));
      
      // Now parse the JSON from the original response
      try {
        responseData = await openRouterResponse.json();
      } catch (jsonError) {
        console.error('❌ Failed to parse OpenRouter response as JSON:');
        console.error(jsonError);
        console.log('Raw response was:', responseText);
        
        // Create a structured response with the parsing error
        return new Response(
          JSON.stringify({ 
            error: 'Failed to parse OpenRouter response',
            details: jsonError.message,
            responseText: responseText.substring(0, 1000)
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      // Log the full response in debug mode
      if (isDebugMode) {
        debugLog.response(isDebugMode, 
                          openRouterResponse.status, 
                          openRouterResponse.headers, 
                          responseData);
      }
    } catch (fetchError) {
      console.error('❌ OpenRouter Fetch Error:');
      console.error(fetchError);
      debugLog.error(isDebugMode, 'OpenRouter Fetch Error', fetchError);
      
      return new Response(
        JSON.stringify({ error: 'Failed to connect to OpenRouter', details: fetchError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!openRouterResponse.ok) {
      console.error('❌ Error response from OpenRouter:', openRouterResponse.status);
      console.error('Error details:', responseData);
      
      debugLog.error(isDebugMode, 'Error from OpenRouter', {
        status: openRouterResponse.status,
        statusText: openRouterResponse.statusText,
        result: responseData
      });
      
      return new Response(
        JSON.stringify({ 
          error: responseData?.error?.message || "Failed to generate metadata",
          status: openRouterResponse.status,
          details: responseData
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Extract the generated content
    const generatedContent = responseData.choices[0]?.message?.content;
    
    if (!generatedContent) {
      console.error('❌ No content in OpenRouter response');
      console.log('Response data:', responseData);
      
      debugLog.error(isDebugMode, 'No content in response', responseData);
      
      return new Response(
        JSON.stringify({ error: "No metadata generated", responseData }),
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
      
      console.log('🔍 Attempting to parse JSON:', jsonString);
      debugLog.log(isDebugMode, "PARSING", 'Attempting to parse JSON:', jsonString);
      
      const metadata = JSON.parse(jsonString);
      
      console.log('✅ Metadata generated successfully!');
      debugLog.log(isDebugMode, "SUCCESS", 'Metadata generated successfully', metadata);
      
      return new Response(
        JSON.stringify({ metadata }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (parseError) {
      console.error('❌ JSON Parse Error:');
      console.error(parseError);
      console.log('Raw content:', generatedContent);
      
      debugLog.error(
        isDebugMode, 
        'JSON Parse Error', 
        {
          error: parseError.message,
          rawContent: generatedContent,
          extractedJsonString: generatedContent.match(/\{[\s\S]*\}/)?.[0] || 'No JSON pattern found'
        }
      );
      
      // Instead of returning an error, try to construct basic metadata
      try {
        const fallbackMetadata = {
          tags: ["auto-generated", "parsing-error", "fallback"],
          summary: "Generated metadata could not be parsed. This is a fallback summary.",
          section_title: "Untitled Section"
        };
        
        console.log('⚠️ Using fallback metadata:', fallbackMetadata);
        
        return new Response(
          JSON.stringify({ 
            metadata: fallbackMetadata,
            warning: "Original metadata parse failed, using fallback"
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      } catch (fallbackError) {
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
    }
  } catch (error) {
    console.error('❌ General function error:');
    console.error(error);
    
    const isDebugMode = debugLog.isDebugMode(req);
    debugLog.error(isDebugMode, 'General function error', error);
    
    return new Response(
      JSON.stringify({ error: error.message, stack: error.stack }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
