
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { corsHeaders, ERROR_CODES } from "./constants.ts";
import { createFallbackResponse } from "./fallbackService.ts";
import { processEstimateRequest } from "./requestProcessor.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check for OpenRouter API key first
    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openRouterApiKey) {
      console.error('E_MISSING_API_KEY: OPENROUTER_API_KEY not found in environment');
      return createFallbackResponse('Missing OpenRouter API key', corsHeaders);
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const body = await req.json();

    return await processEstimateRequest(body, supabaseClient, corsHeaders);

  } catch (error) {
    console.error('Unexpected error in v2-estimate-intent function:', error);
    return createFallbackResponse('Internal server error', corsHeaders);
  }
});
