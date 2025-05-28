
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Initialize Supabase client for database access
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Get room configuration for prompt injection
const getRoomsListForPrompt = () => {
  // This matches the original room configuration from roomConfig.ts
  const rooms = [
    { id: 'living-room', label: 'Living Room', aliases: ['living room', 'main room', 'front room'] },
    { id: 'dining-room', label: 'Dining Room', aliases: ['dining room', 'eating area'] },
    { id: 'kitchen', label: 'Kitchen', aliases: ['kitchen', 'cooking area'] },
    { id: 'master-bedroom', label: 'Master Bedroom', aliases: ['master bedroom', 'primary bedroom', 'main bedroom'] },
    { id: 'bedroom-2', label: 'Bedroom 2', aliases: ['bedroom 2', 'second bedroom', 'guest bedroom'] },
    { id: 'bedroom-3', label: 'Bedroom 3', aliases: ['bedroom 3', 'third bedroom', 'kids bedroom'] },
    { id: 'bedroom-4', label: 'Bedroom 4', aliases: ['bedroom 4', 'fourth bedroom'] },
    { id: 'bathroom-1', label: 'Main Bathroom', aliases: ['main bathroom', 'full bathroom', 'bathroom 1'] },
    { id: 'bathroom-2', label: 'Bathroom 2', aliases: ['bathroom 2', 'second bathroom', 'guest bathroom'] },
    { id: 'powder-room', label: 'Powder Room', aliases: ['powder room', 'half bath', 'guest powder room'] },
    { id: 'hallway', label: 'Hallway', aliases: ['hallway', 'corridor', 'upstairs hallway', 'main hallway'] },
    { id: 'stairway', label: 'Stairway', aliases: ['stairway', 'stairs', 'staircase'] },
    { id: 'family-room', label: 'Family Room', aliases: ['family room', 'den', 'great room'] },
    { id: 'office', label: 'Office', aliases: ['office', 'study', 'home office'] },
    { id: 'laundry-room', label: 'Laundry Room', aliases: ['laundry room', 'utility room'] },
    { id: 'basement', label: 'Basement', aliases: ['basement', 'lower level'] },
    { id: 'garage', label: 'Garage', aliases: ['garage', 'car garage'] },
    { id: 'foyer', label: 'Foyer', aliases: ['foyer', 'entryway', 'entrance'] }
  ];

  return rooms.map(room => 
    `${room.id}: ${room.label} (aliases: ${room.aliases.join(', ')})`
  ).join('\n');
};

// Get active scope extraction prompt from database
const getScopeExtractionPrompt = async (transcript: string) => {
  const { data, error } = await supabase
    .from('estimate_prompt_templates')
    .select('*')
    .eq('purpose', 'scope')
    .eq('active', true)
    .single();

  if (error || !data) {
    console.error('Error fetching scope prompt:', error);
    throw new Error('No active scope extraction prompt found');
  }

  // Inject dynamic data into the prompt
  const roomsListForPrompt = getRoomsListForPrompt();
  let processedPrompt = data.prompt_text;
  
  processedPrompt = processedPrompt.replace(/{roomsListForPrompt}/g, roomsListForPrompt);
  processedPrompt = processedPrompt.replace(/{transcript}/g, transcript);

  return {
    prompt: processedPrompt,
    model: data.model,
    temperature: data.temperature
  };
};

// Clean content to remove markdown formatting
const cleanJsonContent = (content: string): string => {
  // Remove markdown code blocks
  let cleaned = content.trim();
  
  // Remove ```json prefix
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '');
  }
  // Remove ``` prefix (in case json isn't specified)
  else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '');
  }
  
  // Remove ``` suffix
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.replace(/\s*```$/, '');
  }
  
  return cleaned.trim();
};

// Call OpenAI with the processed prompt
const callOpenAI = async (prompt: string, model: string, temperature: number, openAIApiKey: string) => {
  console.log('Calling OpenAI with model:', model, 'temperature:', temperature);
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'system',
          content: 'You are an expert information extraction system. IMPORTANT: Return ONLY valid JSON responses without any markdown formatting, code blocks, or additional text. Do not wrap your response in ```json or ``` blocks.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: temperature,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  let content = data.choices[0].message.content;
  
  console.log('Raw OpenAI response:', content);
  
  // Clean the content to remove any markdown formatting
  content = cleanJsonContent(content);
  
  console.log('Cleaned content:', content);
  
  try {
    return JSON.parse(content);
  } catch (parseError) {
    console.error('Failed to parse OpenAI response as JSON after cleaning:', content);
    console.error('Parse error:', parseError);
    throw new Error('Invalid JSON response from AI');
  }
};

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

    // Get prompt configuration from database
    const { prompt, model, temperature } = await getScopeExtractionPrompt(transcript);
    console.log('Using prompt from database with model:', model, 'temperature:', temperature);
    
    // Call OpenAI with database-configured prompt
    const extractedData = await callOpenAI(prompt, model, temperature, openAIApiKey);

    return new Response(JSON.stringify(extractedData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in extract-information function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        fields: [],
        rooms: [],
        projectMetadata: {}
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
