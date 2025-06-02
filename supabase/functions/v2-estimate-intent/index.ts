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

// Error codes for better debugging
const ERROR_CODES = {
  E_DB_SCHEMA: 'Database schema error',
  E_OPENROUTER_FAIL: 'OpenRouter API failure',
  E_NO_PROMPT_TEMPLATE: 'No prompt template found',
  E_MISSING_API_KEY: 'Missing OpenRouter API key',
  E_VALIDATION_FAILED: 'AI response validation failed'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check for OpenRouter API key first
    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openRouterApiKey) {
      console.error('E_MISSING_API_KEY: OPENROUTER_API_KEY not found in environment');
      return createFallbackResponse('Missing OpenRouter API key');
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

    // Fetch boilerplate texts with better error handling
    let boilerplate;
    try {
      boilerplate = await getBoilerplateTexts(supabaseClient);
    } catch (error) {
      console.error('E_DB_SCHEMA: Error fetching boilerplate texts:', error);
      boilerplate = getDefaultBoilerplate();
    }

    // Get active prompt template with better error handling
    const { data: promptTemplate, error: promptError } = await supabaseClient
      .from('estimate_prompt_templates')
      .select('*')
      .eq('purpose', 'pdf_generation')
      .eq('active', true)
      .maybeSingle();

    if (promptError) {
      console.error('E_DB_SCHEMA: Database error fetching prompt template:', promptError);
      return createFallbackResponse('Database error fetching prompt template');
    }

    if (!promptTemplate) {
      console.error('E_NO_PROMPT_TEMPLATE: No active PDF generation prompt template found');
      return createFallbackResponse('No prompt template configured');
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
    let result;
    try {
      const functionDefinition = createFunctionDefinition();
      result = await callOpenRouterAPI(
        fullPrompt,
        functionDefinition,
        promptTemplate.model,
        promptTemplate.temperature
      );
    } catch (error) {
      console.error('E_OPENROUTER_FAIL: OpenRouter API call failed:', error);
      return createFallbackResponse('AI service temporarily unavailable');
    }

    // Updated to handle the new tools response format
    const toolCalls = result.choices?.[0]?.message?.tool_calls;
    const functionCall = toolCalls?.[0]?.function;

    if (!functionCall || functionCall.name !== "generate_pdf_content") {
      console.error('E_OPENROUTER_FAIL: AI did not use function calling properly');
      return createFallbackResponse('AI response format error');
    }

    // Parse and validate the function call arguments
    let generatedContent;
    try {
      const parsedArgs = JSON.parse(functionCall.arguments);
      generatedContent = PDFContentSchema.parse(parsedArgs);
      console.log('PDF content validated successfully');
    } catch (validationError) {
      console.error('E_VALIDATION_FAILED: Content validation failed:', validationError);
      
      // Return diagnostic error for debugging
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
    console.error('Unexpected error in v2-estimate-intent function:', error);
    return createFallbackResponse('Internal server error');
  }
});

// Create a fallback response with dummy PDF data
function createFallbackResponse(reason: string) {
  console.log(`Creating fallback response due to: ${reason}`);
  
  const fallbackContent = {
    projectOverview: "Thank you for considering our painting services for your project. This estimate provides a comprehensive overview of the proposed work.",
    scopeOfWork: "We will provide complete interior/exterior painting services including surface preparation, primer application, and finish coats using premium materials.",
    materialsAndLabor: "All materials and labor are included in this estimate. We use high-quality paints and professional-grade tools to ensure lasting results.",
    timeline: "Project timeline will be discussed and agreed upon before work begins, taking into account weather conditions and project complexity.",
    termsAndConditions: "Standard terms and conditions apply. Payment schedule and warranty information will be provided with the final contract.",
    additionalNotes: "Please contact us if you have any questions about this estimate or would like to discuss any modifications to the scope of work."
  };

  return new Response(
    JSON.stringify(fallbackContent),
    { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

// Default boilerplate content
function getDefaultBoilerplate() {
  return {
    introduction: 'Thank you for considering our painting services for your project.',
    powerWashing: 'We will thoroughly clean all surfaces to ensure proper paint adhesion.',
    surfacePreparation: 'All surfaces will be properly prepared including scraping, sanding, and priming as needed.',
    paintApplication: 'We use only high-quality paints and materials for lasting results.',
    safetyAndCleanup: 'We maintain a clean and safe work environment throughout the project.',
    specialConsiderations: 'Please note any special requirements or concerns for this project.'
  };
}
