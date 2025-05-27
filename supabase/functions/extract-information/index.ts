
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { transcript } = await req.json()
    
    if (!transcript) {
      throw new Error('No transcript provided')
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Define all valid room IDs and their labels for the AI
    const validRooms = [
      // Living Areas
      { id: "living-room", label: "Living Room", aliases: ["living", "lounge", "sitting room"] },
      { id: "family-room", label: "Family Room", aliases: ["family", "great room", "den"] },
      { id: "dining-room", label: "Dining Room", aliases: ["dining"] },
      
      // Bedrooms
      { id: "master-bedroom", label: "Master Bedroom", aliases: ["master", "primary", "primary bedroom", "main bedroom", "master bedroom"] },
      { id: "bedroom", label: "Bedroom", aliases: ["bedroom", "spare bedroom"] },
      { id: "guest-bedroom", label: "Guest Bedroom", aliases: ["guest", "guest bedroom", "guest room"] },
      { id: "kids-bedroom", label: "Kids Bedroom", aliases: ["kids", "children", "child's room", "kids bedroom", "children's bedroom"] },
      
      // Wet Areas
      { id: "kitchen", label: "Kitchen", aliases: ["kitchen"] },
      { id: "bathroom", label: "Bathroom", aliases: ["bathroom", "bath", "full bath"] },
      { id: "main-bathroom", label: "Main Bathroom", aliases: ["main bathroom", "main bath"] },
      { id: "ensuite-bathroom", label: "Ensuite Bathroom", aliases: ["ensuite", "en-suite", "master bath", "primary bath"] },
      { id: "powder-room", label: "Powder Room", aliases: ["powder", "powder room", "half bath", "guest bath"] },
      { id: "laundry-room", label: "Laundry Room", aliases: ["laundry", "utility", "mud room"] },
      
      // Transitional Spaces
      { id: "hallway", label: "Hallway", aliases: ["hall", "hallway", "corridor", "upstairs hallway", "downstairs hallway"] },
      { id: "entryway", label: "Entryway", aliases: ["entry", "entryway", "entrance"] },
      { id: "foyer", label: "Foyer", aliases: ["foyer"] },
      { id: "staircase", label: "Staircase", aliases: ["stairs", "stairway", "stairwell", "staircase"] },
      
      // Additional Rooms
      { id: "office", label: "Home Office", aliases: ["office", "home office", "study"] },
      { id: "den", label: "Den", aliases: ["den"] },
      { id: "basement", label: "Basement", aliases: ["basement", "lower level"] },
      { id: "recreation-room", label: "Recreation Room", aliases: ["rec room", "recreation", "game room"] },
      { id: "sunroom", label: "Sunroom", aliases: ["sunroom", "sun porch"] },
      { id: "garage", label: "Garage", aliases: ["garage"] },
      { id: "attic", label: "Attic", aliases: ["attic", "loft"] }
    ];

    const roomsListForPrompt = validRooms.map(room => 
      `- ${room.id}: "${room.label}" (also: ${room.aliases.join(', ')})`
    ).join('\n');

    const prompt = `You are an expert at extracting information from painting project transcripts. Extract all relevant information and return it in the specified JSON format.

VALID ROOM IDS AND THEIR ALIASES:
${roomsListForPrompt}

IMPORTANT ROOM EXTRACTION RULES:
- Use ONLY the room IDs listed above (e.g., "master-bedroom", "hallway", "powder-room")
- Map common terms to the correct IDs: "primary bedroom" → "master-bedroom", "upstairs hallway" → "hallway", "half bath" → "powder-room"
- Look for context clues: "upstairs" often refers to bedrooms/hallways, "main floor" to living areas
- Include ALL rooms mentioned, even briefly
- Set surfaces based on what's explicitly mentioned for each room
- Use null for doors/windows if not specified

Extract this information from the transcript:

TRANSCRIPT: "${transcript}"

Return a JSON object with this exact structure:
{
  "fields": [
    {
      "name": "Client Name",
      "value": "extracted name or empty string",
      "confidence": 0.0-1.0,
      "formField": "clientName"
    },
    {
      "name": "Client Email", 
      "value": "extracted email or empty string",
      "confidence": 0.0-1.0,
      "formField": "clientEmail"
    },
    {
      "name": "Client Phone",
      "value": "extracted phone or empty string", 
      "confidence": 0.0-1.0,
      "formField": "clientPhone"
    },
    {
      "name": "Project Address",
      "value": "extracted address or empty string",
      "confidence": 0.0-1.0,
      "formField": "projectAddress"
    },
    {
      "name": "Job Type",
      "value": "interior or exterior",
      "confidence": 0.0-1.0,
      "formField": "jobType"
    },
    {
      "name": "Timeline",
      "value": "extracted timeline or empty string",
      "confidence": 0.0-1.0,
      "formField": "timeline"
    },
    {
      "name": "Rooms To Paint",
      "value": ["array of room names as mentioned"],
      "confidence": 0.0-1.0,
      "formField": "roomsToPaint"
    },
    {
      "name": "Surfaces to Paint",
      "value": ["walls", "ceiling", "trim", "doors", "windows", "cabinets"],
      "confidence": 0.0-1.0,
      "formField": "surfacesToPaint"
    },
    {
      "name": "Preparation Needs",
      "value": ["array of prep work needed"],
      "confidence": 0.0-1.0,
      "formField": "prepNeeds"
    },
    {
      "name": "Color Preferences",
      "value": "extracted colors or empty string",
      "confidence": 0.0-1.0,
      "formField": "colorPalette"
    },
    {
      "name": "Special Notes",
      "value": "any special requirements or notes",
      "confidence": 0.0-1.0,
      "formField": "specialNotes"
    }
  ],
  "rooms": [
    {
      "room_id": "valid-room-id-from-list-above",
      "label": "Room Name As Mentioned",
      "surfaces": {
        "walls": true/false,
        "ceiling": true/false, 
        "trim": true/false,
        "doors": number or null,
        "windows": number or null,
        "cabinets": true/false
      },
      "confidence": 0.0-1.0
    }
  ]
}`

    console.log('Calling OpenAI with prompt for transcript:', transcript.substring(0, 200) + '...')

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at extracting structured information from painting project transcripts. Always return valid JSON that matches the exact schema provided.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI API error:', response.status, errorText)
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0].message.content

    console.log('OpenAI response:', content)

    let extractedData
    try {
      extractedData = JSON.parse(content)
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', content)
      throw new Error('Invalid JSON response from OpenAI')
    }

    console.log('Successfully extracted data:', extractedData)

    return new Response(JSON.stringify(extractedData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in extract-information function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        fields: [],
        rooms: []
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
