
import { createErrorResponse, createSuccessResponse, callOpenRouterAPI } from "./api.ts";
import { createSupabaseClient, updateProposalStatus, getProposalUserId, fetchPromptTemplate, logGeneration } from "./utils.ts";

export async function handleGenerateProposal(req: Request) {
  try {
    // Parse request body
    const body = await req.json();
    const { 
      proposalId, 
      promptId, 
      values, 
      modelName = 'openai/gpt-4o-mini'
    } = body;

    if (!proposalId) {
      return createErrorResponse('Proposal ID is required');
    }

    if (!promptId) {
      return createErrorResponse('Prompt ID is required');
    }

    if (!values || typeof values !== 'object') {
      return createErrorResponse('Form values are required and must be an object');
    }

    // Create Supabase client
    const supabase = createSupabaseClient();

    // Get user info from authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return createErrorResponse('Invalid authorization header', 401);
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error('Auth error:', userError);
      return createErrorResponse('Authentication failed', 401);
    }

    // Update proposal status to "generating"
    const { error: updateError } = await updateProposalStatus(supabase, proposalId, 'generating');
    if (updateError) {
      console.error('Failed to update proposal status:', updateError);
      return createErrorResponse('Failed to update proposal status');
    }

    // Get prompt template
    const { data: promptTemplate, error: promptError } = await fetchPromptTemplate(supabase, promptId);
    if (promptError || !promptTemplate) {
      console.error('Failed to fetch prompt template:', promptError);
      await updateProposalStatus(supabase, proposalId, 'failed');
      return createErrorResponse('Failed to fetch prompt template');
    }

    // Prepare system prompt
    let systemPrompt = promptTemplate.system_prompt;
    
    // If there are placeholders in the system prompt, replace them with actual values
    if (systemPrompt.includes('{{') && systemPrompt.includes('}}')) {
      Object.entries(values).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        if (systemPrompt.includes(placeholder)) {
          systemPrompt = systemPrompt.replace(
            new RegExp(placeholder, 'g'), 
            String(value)
          );
        }
      });
    }

    // Get API key from environment
    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openRouterApiKey) {
      console.error('OpenRouter API key not found');
      await updateProposalStatus(supabase, proposalId, 'failed');
      return createErrorResponse('API key not configured');
    }

    // Call OpenRouter API
    let response;
    try {
      response = await callOpenRouterAPI(systemPrompt, openRouterApiKey);
    } catch (apiError) {
      console.error('OpenRouter API error:', apiError);
      await updateProposalStatus(supabase, proposalId, 'failed');
      
      // Log the failed generation attempt
      await logGeneration(supabase, {
        user_id: user.id,
        user_email: user.email || 'unknown',
        prompt_id: promptId,
        proposal_id: proposalId,
        model_used: modelName,
        system_prompt: systemPrompt,
        final_prompt: systemPrompt, // In this case they're the same
        user_input: values,
        status: 'failed',
        ai_response: null,
        rag_context: null
      });
      
      return createErrorResponse('Failed to generate proposal: API error');
    }

    // Extract the generated text
    const generatedText = response?.choices?.[0]?.message?.content;
    if (!generatedText) {
      console.error('No content in API response');
      await updateProposalStatus(supabase, proposalId, 'failed');
      
      // Log the failed generation attempt
      await logGeneration(supabase, {
        user_id: user.id,
        user_email: user.email || 'unknown',
        prompt_id: promptId,
        proposal_id: proposalId,
        model_used: modelName,
        system_prompt: systemPrompt,
        final_prompt: systemPrompt,
        user_input: values,
        status: 'failed',
        ai_response: null,
        rag_context: null
      });
      
      return createErrorResponse('Failed to generate proposal: Empty response');
    }

    // Update proposal with generated content
    const { error: contentError } = await updateProposalStatus(
      supabase, 
      proposalId, 
      'completed', 
      generatedText
    );

    if (contentError) {
      console.error('Failed to update proposal content:', contentError);
      await updateProposalStatus(supabase, proposalId, 'failed');
      return createErrorResponse('Failed to save generated proposal');
    }

    // Log the successful generation
    await logGeneration(supabase, {
      user_id: user.id,
      user_email: user.email || 'unknown',
      prompt_id: promptId,
      proposal_id: proposalId,
      model_used: modelName,
      system_prompt: systemPrompt,
      final_prompt: systemPrompt,
      user_input: values,
      status: 'success',
      ai_response: generatedText,
      rag_context: null
    });

    return createSuccessResponse({ success: true, content: generatedText });
    
  } catch (error) {
    console.error('Error in generate_proposal function:', error);
    return createErrorResponse(`Internal server error: ${error.message}`);
  }
}
