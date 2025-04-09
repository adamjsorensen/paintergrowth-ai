
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleGenerateProposal } from "./handlers.ts";
import { corsHeaders } from "./utils.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    return await handleGenerateProposal(req);
  } catch (error) {
    console.error('Error in generate_proposal function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
