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

    // Create the prompt for information extraction with specific field mapping
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

## Scope of Work
- Surfaces to Paint (formField: surfacesToPaint) - Array of surfaces like walls, ceilings, trim, doors, cabinets
- Preparation Needs (formField: prepNeeds) - Array of prep work like scraping, sanding, patching
- Color Preferences (formField: colorPalette) - Any color preferences mentioned

For each piece of information, provide:
- The extracted value (formatted appropriately)
- A confidence score (0.0 to 1.0) indicating how certain you are about this extraction
- The corresponding form field name as specified above

EXAMPLES:

Example 1:
Transcript: "I'm John Smith and I need my living room and kitchen painted. The walls are in pretty good shape but will need some patching. I'm thinking of a light blue color. My number is 555-123-4567 and my address is 123 Main Street."

Response:
{
  "fields": [
    {
      "name": "Client Name",
      "value": "John Smith",
      "confidence": 0.95,
      "formField": "clientName"
    },
    {
      "name": "Client Phone",
      "value": "555-123-4567",
      "confidence": 0.9,
      "formField": "clientPhone"
    },
    {
      "name": "Project Address",
      "value": "123 Main Street",
      "confidence": 0.85,
      "formField": "projectAddress"
    },
    {
      "name": "Job Type",
      "value": "interior",
      "confidence": 0.8,
      "formField": "jobType"
    },
    {
      "name": "Surfaces to Paint",
      "value": ["walls"],
      "confidence": 0.7,
      "formField": "surfacesToPaint"
    },
    {
      "name": "Preparation Needs",
      "value": ["patching"],
      "confidence": 0.8,
      "formField": "prepNeeds"
    },
    {
      "name": "Color Preferences",
      "value": "light blue",
      "confidence": 0.85,
      "formField": "colorPalette"
    }
  ]
}

Example 2:
Transcript: "We're looking at a 2-story house, about 2500 square feet. The homeowner wants all the bedrooms and bathrooms painted, plus the trim throughout. They want to start in about 3 weeks. The house is at 456 Oak Avenue."

Response:
{
  "fields": [
    {
      "name": "Project Address",
      "value": "456 Oak Avenue",
      "confidence": 0.9,
      "formField": "projectAddress"
    },
    {
      "name": "Job Type",
      "value": "interior",
      "confidence": 0.85,
      "formField": "jobType"
    },
    {
      "name": "Square Footage",
      "value": 2500,
      "confidence": 0.9,
      "formField": "squareFootage"
    },
    {
      "name": "Timeline",
      "value": "3 weeks",
      "confidence": 0.8,
      "formField": "timeline"
    },
    {
      "name": "Surfaces to Paint",
      "value": ["walls", "trim"],
      "confidence": 0.85,
      "formField": "surfacesToPaint"
    }
  ]
}

Now, analyze the following transcript and extract all relevant information:

${transcript}

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