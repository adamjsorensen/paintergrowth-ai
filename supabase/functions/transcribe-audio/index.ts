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
    const { audioBase64 } = await req.json();
    
    if (!audioBase64) {
      return new Response(
        JSON.stringify({ error: 'No audio data provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get OpenAI API key from environment
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log request details for debugging
    console.log(`Transcribing audio: ${audioBase64.substring(0, 50)}... (${audioBase64.length} bytes)`);

    try {
      // Convert base64 to binary
      const binaryData = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));
      
      // Create a blob from the binary data
      const blob = new Blob([binaryData], { type: 'audio/wav' });
      
      // Create a FormData object
      const formData = new FormData();
      formData.append('file', blob, 'audio.wav');
      formData.append('model', 'whisper-1');
      formData.append('language', 'en'); // Specify English language for better accuracy
      formData.append('response_format', 'json'); // Ensure JSON response
      
      // Call OpenAI Whisper API with retry logic
      let response;
      let retries = 0;
      const maxRetries = 3;
      
      while (retries < maxRetries) {
        try {
          console.log(`Attempt ${retries + 1} to call OpenAI API`);
          
          response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openaiApiKey}`
            },
            body: formData
          });
          
          if (response.ok) {
            break; // Success, exit retry loop
          } else {
            const errorText = await response.text();
            console.error(`OpenAI API error (attempt ${retries + 1}):`, errorText);
            
            // If we get a rate limit error, wait longer before retrying
            if (response.status === 429) {
              await new Promise(resolve => setTimeout(resolve, 2000 * (retries + 1)));
            }
          }
        } catch (fetchError) {
          console.error(`Fetch error (attempt ${retries + 1}):`, fetchError);
        }
        
        retries++;
        
        // Wait before retrying
        if (retries < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
        }
      }

      if (!response || !response.ok) {
        throw new Error(`Failed to transcribe audio after ${maxRetries} attempts`);
      }

      const data = await response.json();
      console.log("Transcription successful");
      
      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (processingError) {
      console.error('Error processing audio:', processingError);
      return new Response(
        JSON.stringify({ error: `Error processing audio: ${processingError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in transcribe-audio function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});