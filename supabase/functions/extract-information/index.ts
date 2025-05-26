
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
    const requestBody = await req.json();
    console.log('Received request body:', JSON.stringify(requestBody, null, 2));
    
    // Accept either 'transcript' or 'text' for backward compatibility
    const { transcript, text } = requestBody;
    const inputText = transcript || text;
    
    if (!inputText) {
      console.error('Missing required field: transcript or text');
      return new Response(
        JSON.stringify({ 
          error: 'Missing required field: transcript or text', 
          received: Object.keys(requestBody) 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log input length for debugging
    console.log(`Processing text of length: ${inputText.length} characters`);

    // Get OpenRouter API key from environment
    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openRouterApiKey) {
      console.error('OpenRouter API key not configured');
      return new Response(
        JSON.stringify({ error: 'OpenRouter API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create the prompt for information extraction with enhanced room detection
    const prompt = `You are an AI assistant for painting contractors. Your task is to extract relevant information from a summary of a property walkthrough or project discussion with a client.

## INPUT SUMMARY:
${inputText}

## YOUR TASK:

============================================================================
OUTPUT CONTRACT  (HARD LIMIT = 1 000 TOKENS — drop lowest‑confidence items first)
Return **ONLY** a valid, minified JSON object with the two top‑level keys shown
below.  Do **not** wrap the response in markdown.

{
  "fields":[
    {"name":"","value":"","confidence":0.00,"formField":""}
  ],
  "rooms":[
    {
      "room_id":"",
      "label":"",
      "surfaces":{
        "walls":false,
        "ceiling":false,
        "trim":false,
        "doors":null,     // integer ≥0 OR null when count unknown
        "windows":null,   // integer ≥0 OR null when count unknown
        "cabinets":false
      },
      "confidence":0.00
    }
  ]
}
============================================================================

CONFIDENCE RULES
• Every object in **fields** and **rooms** must include a \`confidence\` float          
  0.00 – 1.00 with exactly two decimal places.  
• If confidence < 0.25 **or** the datum is absent, omit that object entirely —  
  never invent data.

────────────────────────────────────────────────────────────────────────────
CLIENT INFORMATION
• Client Name      (formField \`clientName\`)  
• Client Email     (formField \`clientEmail\`)  
• Client Phone     (formField \`clientPhone\`)  
• Project Address  (formField \`projectAddress\`)

PROJECT DETAILS
• Job Type         (formField \`jobType\`) – one of: **interior**, **exterior**,  
  **deck**, **commercial**  
• Square Footage   (formField \`squareFootage\`) – integer (sq ft)  
• Timeline         (formField \`timeline\`) – either an ISO‑8601 date string  
  (\`"2025-06-01"\`) **or** an object \`{"relative":"<text>"}\`  
• Special Notes    (formField \`specialNotes\`)

INTERIOR ROOMS   (only when \`jobType = "interior"\`)
• Rooms To Paint   (formField \`roomsToPaint\`) – array of room names.  
• For each detected room add an entry to **rooms** using the exact structure
  shown in the OUTPUT CONTRACT.  
  ‑ \`room_id\` = canonical snake‑case id (e.g. \`"living-room"\`).  
  ‑ \`label\`   = human‑readable name (e.g. \`"Living Room"\`).  
  ‑ \`doors\` and \`windows\` are integer counts **or** null if count not stated.

SCOPE OF WORK
• Surfaces to Paint  (formField \`surfacesToPaint\`) – array  
• Preparation Needs  (formField \`prepNeeds\`)       – array  
• Color Preferences  (formField \`colorPalette\`)

────────────────────────────────────────────────────────────────────────────
EXAMPLE 1  (Interior)

Transcript:  
"I'm visiting the Johnson residence at 42 Oak Street. They want to paint the living room walls and ceiling, plus the kitchen cabinets. The master bedroom needs all walls and trim done. They mentioned they want a light blue for the bedroom and white for the kitchen cabinets. The house is about 1,800 square feet and they want to start in two weeks."

Response:  
{
  "fields":[
    {"name":"Client Name","value":"Johnson","confidence":0.90,"formField":"clientName"},
    {"name":"Project Address","value":"42 Oak Street","confidence":0.95,"formField":"projectAddress"},
    {"name":"Job Type","value":"interior","confidence":0.95,"formField":"jobType"},
    {"name":"Square Footage","value":1800,"confidence":0.90,"formField":"squareFootage"},
    {"name":"Timeline","value":{"relative":"2 weeks"},"confidence":0.85,"formField":"timeline"},
    {"name":"Rooms To Paint","value":["living room","kitchen","master bedroom"],"confidence":0.95,"formField":"roomsToPaint"},
    {"name":"Surfaces to Paint","value":["walls","ceiling","trim","cabinets"],"confidence":0.90,"formField":"surfacesToPaint"},
    {"name":"Color Preferences","value":"light blue for bedroom, white for kitchen cabinets","confidence":0.85,"formField":"colorPalette"}
  ],
  "rooms":[
    {
      "room_id":"living-room",
      "label":"Living Room",
      "surfaces":{"walls":true,"ceiling":true,"trim":false,"doors":null,"windows":null,"cabinets":false},
      "confidence":0.90
    },
    {
      "room_id":"kitchen",
      "label":"Kitchen",
      "surfaces":{"walls":false,"ceiling":false,"trim":false,"doors":null,"windows":null,"cabinets":true},
      "confidence":0.90
    },
    {
      "room_id":"master-bedroom",
      "label":"Master Bedroom",
      "surfaces":{"walls":true,"ceiling":false,"trim":true,"doors":null,"windows":null,"cabinets":false},
      "confidence":0.90
    }
  ]
}

────────────────────────────────────────────────────────────────────────────
EXAMPLE 2  (Exterior)

Transcript:  
"We're looking at painting the exterior of this two‑story house at 123 Maple Drive. The homeowner, Mr. Smith, wants all the siding and trim painted, plus the garage door. The house is blue now but they want to change it to a warm gray. Some areas need scraping and priming where the paint is peeling."

Response:  
{
  "fields":[
    {"name":"Client Name","value":"Smith","confidence":0.90,"formField":"clientName"},
    {"name":"Project Address","value":"123 Maple Drive","confidence":0.95,"formField":"projectAddress"},
    {"name":"Job Type","value":"exterior","confidence":0.95,"formField":"jobType"},
    {"name":"Surfaces to Paint","value":["siding","trim","garage door"],"confidence":0.90,"formField":"surfacesToPaint"},
    {"name":"Preparation Needs","value":["scraping","priming"],"confidence":0.85,"formField":"prepNeeds"},
    {"name":"Color Preferences","value":"warm gray (changing from blue)","confidence":0.90,"formField":"colorPalette"}
  ],
  "rooms":[]
}

────────────────────────────────────────────────────────────────────────────
Now, analyze the following transcript and extract all relevant information.

**Return nothing but the JSON object described above.**  
If the result would exceed 1 000 tokens, discard the lowest‑confidence items until it fits.`;

    console.log("Sending request to OpenRouter API");

    // Track token usage (using the input text length for a rough estimate)
    const inputTokens = inputText.length / 4; // Rough estimate
    console.log(`Estimated input tokens: ${Math.ceil(inputTokens)}`);

    // Implement retry logic for API calls
    const maxRetries = 3;
    let retryCount = 0;
    let response;
    let responseData;

    while (retryCount < maxRetries) {
      try {
        // Call OpenRouter API (using GPT-4o)
        response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openRouterApiKey}`,
            'HTTP-Referer': 'https://lovable.dev',
            'X-Title': 'Paintergrowth.ai'
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              { role: 'user', content: prompt }
            ],
            temperature: 0.2,
            max_tokens: 1500
          })
        });

        if (response.ok) {
          responseData = await response.json();
          console.log('OpenRouter API response received successfully');
          break; // Success, exit retry loop
        } else {
          const errorText = await response.text();
          console.error(`OpenRouter API error (attempt ${retryCount + 1}):`, errorText);
          
          // If we get a rate limit error, wait longer before retrying
          if (response.status === 429) {
            await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1)));
          }
        }
      } catch (fetchError) {
        console.error(`Fetch error (attempt ${retryCount + 1}):`, fetchError);
      }
      
      retryCount++;
      
      // Wait before retrying
      if (retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }

    if (!response || !response.ok) {
      console.error(`Information extraction failed after ${maxRetries} attempts`);
      return new Response(
        JSON.stringify({ error: `Information extraction failed after ${maxRetries} attempts` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const content = responseData.choices[0]?.message?.content;
    
    if (!content) {
      console.error('No content returned from AI');
      return new Response(
        JSON.stringify({ error: 'No content returned from AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Track token usage
    const outputTokens = content.length / 4; // Rough estimate
    console.log(`Estimated output tokens: ${Math.ceil(outputTokens)}`);
    console.log(`Total estimated tokens: ${Math.ceil(inputTokens + outputTokens)}`);

    console.log("Processing AI response");

    // Parse the JSON response from the AI
    try {
      // Find JSON in the response (in case there's any wrapper text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : content;
      
      try {
        const extractedData = JSON.parse(jsonString);
        console.log("Successfully parsed extracted data");
        console.log("Extracted data structure:", JSON.stringify({
          fieldsCount: extractedData.fields?.length || 0,
          roomsCount: extractedData.rooms?.length || 0
        }));
        
        // Validate the structure of the extracted data
        if (!extractedData.fields && !extractedData.rooms) {
          throw new Error("Invalid response format: missing required keys");
        }
        
        return new Response(
          JSON.stringify(extractedData),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError);
        console.error('Raw JSON string:', jsonString);
        
        // Try to clean up the JSON string and parse again
        const cleanedJsonString = jsonString
          .replace(/\\n/g, "\\n")
          .replace(/\\'/g, "\\'")
          .replace(/\\"/g, '\\"')
          .replace(/\\&/g, "\\&")
          .replace(/\\r/g, "\\r")
          .replace(/\\t/g, "\\t")
          .replace(/\\b/g, "\\b")
          .replace(/\\f/g, "\\f");
          
        try {
          const extractedData = JSON.parse(cleanedJsonString);
          console.log("Successfully parsed extracted data after cleanup");
          
          return new Response(
            JSON.stringify(extractedData),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (secondJsonError) {
          console.error('Second JSON parsing attempt failed:', secondJsonError);
          throw new Error(`Failed to parse JSON: ${secondJsonError.message}`);
        }
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('Raw content:', content);
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to parse AI response', 
          rawContent: content.substring(0, 500) + (content.length > 500 ? '...' : '')
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
