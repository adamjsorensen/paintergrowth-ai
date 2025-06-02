
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { PDFContentSchema } from "./schemas.ts";
import { getBoilerplateTexts } from "./boilerplateCache.ts";
import { callOpenRouterAPI, createFunctionDefinition } from "./openaiService.ts";
import { prepareStructuredInput, buildPrompt } from "./dataProcessor.ts";
import { ERROR_CODES } from "./constants.ts";
import { getDefaultBoilerplate, createFallbackResponse } from "./fallbackService.ts";

export async function processEstimateRequest(
  body: any,
  supabaseClient: any,
  corsHeaders: Record<string, string>
): Promise<Response> {
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
    return createFallbackResponse('Database error fetching prompt template', corsHeaders);
  }

  if (!promptTemplate) {
    console.error('E_NO_PROMPT_TEMPLATE: No active PDF generation prompt template found');
    return createFallbackResponse('No prompt template configured', corsHeaders);
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
    return createFallbackResponse('AI service temporarily unavailable', corsHeaders);
  }

  // Updated to handle the new tools response format
  const toolCalls = result.choices?.[0]?.message?.tool_calls;
  const functionCall = toolCalls?.[0]?.function;

  if (!functionCall || functionCall.name !== "generate_pdf_content") {
    console.error('E_OPENROUTER_FAIL: AI did not use function calling properly');
    return createFallbackResponse('AI response format error', corsHeaders);
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
}
