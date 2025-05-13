
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

    // Log transcript length for debugging
    console.log(`Processing transcript of length: ${transcript.length} characters`);

    // Get OpenRouter API key from environment
    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openRouterApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenRouter API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create the prompt for information extraction with enhanced room detection
    const prompt = `
You are an AI assistant for painting contractors. Your task is to extract relevant information from a transcript of a contractor walking through a property or discussing a project with a client.

Extract the following information with specific field mappings:

## Client Information
- Client Name (formField: clientName)
- Client Email (formField: clientEmail)
- Client Phone (formField: clientPhone)
- Project Address (formField: projectAddress)

## Project Details
- Job Type (formField: jobType) - Choose from: interior, exterior, cabinets, deck, commercial
- Square Footage (formField: squareFootage) - Numeric value only
- Timeline or Start Date (formField: timeline) - Date or timeframe
- Special Notes (formField: specialNotes) - Any special requirements or concerns

## Interior Rooms
For interior projects, identify specific rooms mentioned and what needs to be painted in each room:
- Rooms To Paint (formField: roomsToPaint) - Array of room names like living room, bedroom, kitchen, etc.
- For EACH room identified, create a separate field named after the room with surfaces to paint, like:
  - Living Room (formField: livingRoom) - Object containing:
    - Walls (boolean)
    - Ceiling (boolean) 
    - Trim (boolean)
    - Doors (number of doors or boolean)
    - Windows (number of windows or boolean)
    - Cabinets (boolean)

## Scope of Work
- Surfaces to Paint (formField: surfacesToPaint) - Array of surfaces like walls, ceilings, trim, doors, cabinets
- Preparation Needs (formField: prepNeeds) - Array of prep work like scraping, sanding, patching
- Color Preferences (formField: colorPalette) - Any color preferences mentioned

For each piece of information, provide:
- The extracted value (formatted appropriately)
- A confidence score (0.0 to 1.0) indicating how certain you are about this extraction
- The corresponding form field name as specified above

EXAMPLES:

Example 1 (Interior):
Transcript: "I'm visiting the Johnson residence at 42 Oak Street. They want to paint the living room walls and ceiling, plus the kitchen cabinets. The master bedroom needs all walls and trim done. They mentioned they want a light blue for the bedroom and white for the kitchen cabinets. The house is about 1,800 square feet and they want to start in two weeks."

Response:
{
  "fields": [
    {
      "name": "Client Name",
      "value": "Johnson",
      "confidence": 0.9,
      "formField": "clientName"
    },
    {
      "name": "Project Address",
      "value": "42 Oak Street",
      "confidence": 0.95,
      "formField": "projectAddress"
    },
    {
      "name": "Job Type",
      "value": "interior",
      "confidence": 0.95,
      "formField": "jobType"
    },
    {
      "name": "Square Footage",
      "value": 1800,
      "confidence": 0.9,
      "formField": "squareFootage"
    },
    {
      "name": "Timeline",
      "value": "two weeks",
      "confidence": 0.85,
      "formField": "timeline"
    },
    {
      "name": "Rooms To Paint",
      "value": ["living room", "kitchen", "master bedroom"],
      "confidence": 0.95,
      "formField": "roomsToPaint"
    },
    {
      "name": "Living Room",
      "value": {
        "walls": true,
        "ceiling": true,
        "trim": false,
        "doors": false,
        "windows": false,
        "cabinets": false
      },
      "confidence": 0.9,
      "formField": "livingRoom"
    },
    {
      "name": "Kitchen",
      "value": {
        "walls": false,
        "ceiling": false,
        "trim": false,
        "doors": false,
        "windows": false,
        "cabinets": true
      },
      "confidence": 0.9,
      "formField": "kitchen"
    },
    {
      "name": "Master Bedroom",
      "value": {
        "walls": true,
        "ceiling": false,
        "trim": true,
        "doors": false,
        "windows": false,
        "cabinets": false
      },
      "confidence": 0.9,
      "formField": "masterBedroom"
    },
    {
      "name": "Surfaces to Paint",
      "value": ["walls", "ceiling", "trim", "cabinets"],
      "confidence": 0.9,
      "formField": "surfacesToPaint"
    },
    {
      "name": "Color Preferences",
      "value": "light blue for bedroom, white for kitchen cabinets",
      "confidence": 0.85,
      "formField": "colorPalette"
    }
  ]
}

Example 2 (Exterior):
Transcript: "We're looking at painting the exterior of this two-story house at 123 Maple Drive. The homeowner, Mr. Smith, wants all the siding and trim painted, plus the garage door. The house is blue now but they want to change it to a warm gray. Some areas need scraping and priming where the paint is peeling."

Response:
{
  "fields": [
    {
      "name": "Client Name",
      "value": "Smith",
      "confidence": 0.9,
      "formField": "clientName"
    },
    {
      "name": "Project Address",
      "value": "123 Maple Drive",
      "confidence": 0.95,
      "formField": "projectAddress"
    },
    {
      "name": "Job Type",
      "value": "exterior",
      "confidence": 0.95,
      "formField": "jobType"
    },
    {
      "name": "Surfaces to Paint",
      "value": ["siding", "trim", "garage door"],
      "confidence": 0.9,
      "formField": "surfacesToPaint"
    },
    {
      "name": "Preparation Needs",
      "value": ["scraping", "priming"],
      "confidence": 0.85,
      "formField": "prepNeeds"
    },
    {
      "name": "Color Preferences",
      "value": "warm gray (changing from blue)",
      "confidence": 0.9,
      "formField": "colorPalette"
    }
  ]
}

Now, analyze the following transcript and extract all relevant information:

${transcript}

Focus especially on identifying specific rooms and what surfaces need to be painted within each room. Be thorough in your extraction of room-specific details.

Respond ONLY with a valid JSON object containing the extracted fields. Do not include any explanatory text outside the JSON structure.
`;

    console.log("Sending request to OpenRouter API");

    // Track token usage
    const inputTokens = prompt.length / 4; // Rough estimate
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
      return new Response(
        JSON.stringify({ error: `Information extraction failed after ${maxRetries} attempts` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const content = responseData.choices[0]?.message?.content;
    
    if (!content) {
      return new Response(
        JSON.stringify({ error: 'No content returned from AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Track token usage
    const outputTokens = content.length / 4; // Rough estimate
    console.log(`Estimated output tokens: ${Math.ceil(outputTokens)}`);
    console.log(`Total estimated tokens: ${Math.ceil(inputTokens + outputTokens)}`);

    console.log("Received response from OpenRouter API");

    // Parse the JSON response from the AI
    try {
      // Find JSON in the response (in case there's any wrapper text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : content;
      
      try {
        const extractedData = JSON.parse(jsonString);
        console.log("Successfully parsed extracted data");
        
        // Validate the structure of the extracted data
        if (!extractedData.fields || !Array.isArray(extractedData.fields)) {
          throw new Error("Invalid response format: missing fields array");
        }
        
        return new Response(
          JSON.stringify(extractedData),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError);
        
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
          throw new Error(`Failed to parse JSON: ${secondJsonError.message}`);
        }
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('Raw content:', content);
      
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
