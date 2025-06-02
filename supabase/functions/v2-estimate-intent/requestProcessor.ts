
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { getBoilerplateTexts } from "./boilerplateCache.ts";
import { callOpenRouterAPI, parseAIResponse } from "./openaiService.ts";
import { prepareStructuredInput, buildPrompt } from "./dataProcessor.ts";
import { validateAndFixContent } from "./contentValidator.ts";
import { createFallbackResponse } from "./fallbackService.ts";

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

  console.log('Processing estimate intent with flexible JSON parsing approach');
  console.log('REQUEST DATA SUMMARY:');
  console.log(`- Project Type: ${projectType}`);
  console.log(`- Client: ${clientInfo?.name || estimateData?.clientName || 'Not specified'}`);
  console.log(`- Line Items: ${lineItems ? lineItems.length : 0} items`);
  console.log(`- Rooms Matrix: ${roomsMatrix ? roomsMatrix.length : 0} rooms`);

  // Validate required data with better error messages
  if (!estimateData && !clientInfo) {
    console.error('E_VALIDATION_FAILED: Missing required estimate or client data');
    return new Response(
      JSON.stringify({
        error: 'MISSING_REQUIRED_DATA',
        message: 'Missing required estimate or client information',
        details: 'Please provide either estimateData or clientInfo'
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  if (!projectType) {
    console.error('E_VALIDATION_FAILED: Missing project type');
    return new Response(
      JSON.stringify({
        error: 'MISSING_PROJECT_TYPE',
        message: 'Project type is required (interior or exterior)',
        details: 'Please specify the project type'
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Fetch boilerplate texts with better error handling
  let boilerplate;
  try {
    boilerplate = await getBoilerplateTexts(supabaseClient);
  } catch (error) {
    console.error('E_DB_SCHEMA: Error fetching boilerplate texts:', error);
    boilerplate = {};
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

  // Prepare structured data for AI with validation
  let structuredInput;
  try {
    structuredInput = prepareStructuredInput(
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

    // Add line items and add-ons to structured input
    structuredInput.lineItems = lineItems || [];
    structuredInput.addOns = addOns || estimateData?.addOns || [];

  } catch (error) {
    console.error('E_DATA_PROCESSING: Error preparing structured input:', error);
    return new Response(
      JSON.stringify({
        error: 'DATA_PROCESSING_ERROR',
        message: 'Failed to process input data',
        details: error.message
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Replace placeholders in prompt and add JSON formatting instructions
  const basePrompt = buildPrompt(promptTemplate.prompt_text, structuredInput);
  const fullPrompt = `${basePrompt}

IMPORTANT: Return your response as a valid JSON object with the following structure:

{
  "coverPage": {
    "estimateDate": "string",
    "estimateNumber": "string", 
    "proposalNumber": "string",
    "clientName": "string",
    "clientPhone": "string",
    "clientEmail": "string",
    "projectAddress": "string",
    "estimatorName": "string",
    "estimatorEmail": "string",
    "estimatorPhone": "string"
  },
  "projectOverview": "string - comprehensive project overview",
  "scopeOfWork": "string - detailed scope of work description",
  "lineItems": [
    {
      "description": "string",
      "quantity": number,
      "unit": "string",
      "unitPrice": number,
      "total": number
    }
  ],
  "addOns": [
    {
      "description": "string",
      "price": number,
      "selected": boolean
    }
  ],
  "pricing": {
    "subtotal": number,
    "tax": number,
    "total": number,
    "taxRate": "string"
  },
  "termsAndConditions": "string - terms and conditions text",
  "companyInfo": {
    "name": "string",
    "address": "string",
    "phone": "string",
    "email": "string",
    "website": "string (optional)"
  },
  "signatures": {
    "clientSignatureRequired": boolean,
    "warrantyInfo": "string"
  }
}

Make sure to:
1. Generate meaningful, project-specific content for each section
2. Include all required fields
3. Use proper data types (strings, numbers, booleans, arrays)
4. Return ONLY the JSON object, no additional text or formatting`;

  console.log('PROMPT CONSTRUCTED WITH LENGTH:', fullPrompt.length);
  console.log('PROMPT FIRST 500 CHARS:', fullPrompt.substring(0, 500));
  console.log('PROMPT LAST 500 CHARS:', fullPrompt.substring(fullPrompt.length - 500));

  console.log('Calling OpenRouter with flexible JSON parsing mode');

  // Use regular OpenAI call instead of function calling
  let result;
  try {
    result = await callOpenRouterAPI(
      fullPrompt,
      promptTemplate.model,
      promptTemplate.temperature
    );
  } catch (error) {
    console.error('E_OPENROUTER_FAIL: OpenRouter API call failed:', error);
    return createFallbackResponse('AI service temporarily unavailable', corsHeaders);
  }

  // Parse the AI response
  let aiContent;
  try {
    const responseText = result.choices?.[0]?.message?.content;
    if (!responseText) {
      throw new Error('No content in AI response');
    }
    
    console.log('AI Response received, parsing JSON...');
    console.log('RESPONSE FIRST 500 CHARS:', responseText.substring(0, 500));
    console.log('RESPONSE LAST 500 CHARS:', responseText.substring(responseText.length - 500));
    
    aiContent = parseAIResponse(responseText);
    
  } catch (parseError) {
    console.error('E_PARSE_FAILED: Failed to parse AI response:', parseError);
    return createFallbackResponse('AI response parsing failed', corsHeaders);
  }

  // Validate and fix the content using our flexible validator
  const validationResult = validateAndFixContent(aiContent, structuredInput);
  
  if (validationResult.fixedSections.length > 0) {
    console.log(`Fixed sections: ${validationResult.fixedSections.join(', ')}`);
  }
  
  if (validationResult.errors.length > 0) {
    console.log(`Validation warnings: ${validationResult.errors.join(', ')}`);
  }

  console.log('CONTENT COMPARISON:');
  console.log(`- Input project type: ${projectType}`);
  console.log(`- Input client: ${structuredInput.clientName}`);
  console.log(`- Output client: ${validationResult.content.coverPage.clientName}`);
  console.log(`- Project Overview (first 100 chars): ${validationResult.content.projectOverview.substring(0, 100)}...`);
  console.log(`- Scope of Work (first 100 chars): ${validationResult.content.scopeOfWork.substring(0, 100)}...`);
  console.log(`- Line Items: ${validationResult.content.lineItems.length} items`);

  console.log('PDF content processed successfully with flexible validation');

  return new Response(
    JSON.stringify(validationResult.content),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
