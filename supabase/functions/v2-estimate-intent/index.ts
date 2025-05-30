
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { PDFContentSchema } from "./schemas.ts";
import { getBoilerplateTexts } from "./boilerplateCache.ts";
import { callOpenRouterAPI, createFunctionDefinition } from "./openaiService.ts";
import { prepareStructuredInput, buildPrompt } from "./dataProcessor.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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
    const { 
      estimateData, 
      projectType, 
      lineItems, 
      totals, 
      roomsMatrix, 
      clientNotes,
      companyProfile,
      clientInfo,
      taxRate,
      addOns,
      upsells = [],
      colorApprovals = []
    } = body;

    console.log('Processing estimate intent with structured data');

    // Fetch boilerplate texts with caching
    const boilerplate = await getBoilerplateTexts(supabaseClient);

    // Get active prompt template
    const { data: promptTemplate, error: promptError } = await supabaseClient
      .from('estimate_prompt_templates')
      .select('*')
      .eq('purpose', 'pdf_generation')
      .eq('active', true)
      .single();

    if (promptError || !promptTemplate) {
      console.error('No active prompt template found');
      return new Response(
        JSON.stringify({ error: 'No active PDF generation prompt template found' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare structured data for AI
    const structuredInput = prepareStructuredInput(
      estimateData,
      projectType,
      totals,
      roomsMatrix,
      clientNotes,
      companyProfile,
      clientInfo,
      taxRate,
      boilerplate,
      upsells,
      colorApprovals
    );

    // Replace placeholders in prompt
    const fullPrompt = buildPrompt(promptTemplate.prompt_text, structuredInput);

    console.log('Calling OpenRouter with function calling mode');

    // Use OpenAI function calling with structured schema
    const functionDefinition = createFunctionDefinition();
    const result = await callOpenRouterAPI(
      fullPrompt,
      functionDefinition,
      promptTemplate.model,
      promptTemplate.temperature
    );

    const functionCall = result.choices[0]?.message?.function_call;

    if (!functionCall || functionCall.name !== "generate_pdf_content") {
      throw new Error('AI did not use function calling properly');
    }

    // Parse and validate the function call arguments
    let generatedContent;
    try {
      const parsedArgs = JSON.parse(functionCall.arguments);
      generatedContent = PDFContentSchema.parse(parsedArgs);
      console.log('PDF content validated successfully');
    } catch (validationError) {
      console.error('Validation failed:', validationError);
      
      // Return diagnostic error PDF instead of fallback
      return new Response(
        JSON.stringify({
          error: 'AI_VALIDATION_FAILED',
          message: 'Generated content failed validation',
          rawResponse: functionCall.arguments,
          validationErrors: validationError.errors || validationError.message
        }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('PDF intent processed successfully');

    return new Response(
      JSON.stringify(generatedContent),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in v2-estimate-intent function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'PROCESSING_FAILED',
        message: error.message,
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
