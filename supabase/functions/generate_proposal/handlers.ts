
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createErrorResponse, createSuccessResponse, callOpenRouterAPI } from "./api.ts";
import { renderPrompt } from "./utils.ts";
import { createSupabaseClient, updateProposalStatus, fetchPromptTemplate, fetchAISettings, logGeneration } from "./utils.ts";

export async function handleGenerateProposal(req: Request) {
  try {
    const body = await req.json();
    const { proposalId, promptId, values } = body;

    if (!proposalId || !promptId) {
      return createErrorResponse('Proposal ID and Prompt ID are required');
    }

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

    // Fetch AI settings and prompt template
    const { default_system_prompt, seed_prompt } = await fetchAISettings(supabase);
    const { data: tpl, error: promptError } = await fetchPromptTemplate(supabase, promptId);

    if (promptError || !tpl) {
      console.error('Failed to fetch prompt template:', promptError);
      await updateProposalStatus(supabase, proposalId, 'failed');
      return createErrorResponse('Failed to fetch prompt template');
    }

    // Prepare system message with optional override
    const systemMsg = tpl.system_prompt_override ?? default_system_prompt;
    
    try {
      // Render the template prompt with values
      const bodyMsg = renderPrompt(tpl.template_prompt, values);
      
      // Prepare messages array for OpenRouter
      const messages = [
        { role: "system", content: systemMsg },
        { role: "user",   content: seed_prompt },
        { role: "user",   content: bodyMsg }
      ];

      // Get API key from environment
      const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
      if (!openRouterApiKey) {
        console.error('OpenRouter API key not found');
        await updateProposalStatus(supabase, proposalId, 'failed');
        return createErrorResponse('API key not configured');
      }

      // Call OpenRouter API
      const aiSettings = await fetchAISettings(supabase);
      let response;
      try {
        response = await callOpenRouterAPI(messages, openRouterApiKey, aiSettings);
      } catch (apiError) {
        console.error('OpenRouter API error:', apiError);
        await updateProposalStatus(supabase, proposalId, 'failed');
        
        // Log the failed generation attempt
        await logGeneration(supabase, {
          user_id: user.id,
          user_email: user.email || 'unknown',
          prompt_id: promptId,
          proposal_id: proposalId,
          model_used: aiSettings.model,
          system_prompt: systemMsg,
          final_prompt: bodyMsg,
          user_input: values,
          status: 'failed',
          ai_response: null,
          rag_context: null
        });
        
        return createErrorResponse('Failed to generate proposal: API error');
      }

      // Extract and save the generated text
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
          model_used: aiSettings.model,
          system_prompt: systemMsg,
          final_prompt: bodyMsg,
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
        model_used: aiSettings.model,
        system_prompt: systemMsg,
        final_prompt: bodyMsg,
        user_input: values,
        status: 'success',
        ai_response: generatedText,
        rag_context: null
      });

      return createSuccessResponse({ success: true, content: generatedText });
    } catch (renderError) {
      console.error('Failed to render template:', renderError);
      await updateProposalStatus(supabase, proposalId, 'failed');
      
      return createErrorResponse(`Template rendering error: ${renderError.message}`);
    }
  } catch (error) {
    console.error('Error in generate_proposal function:', error);
    return createErrorResponse(`Internal server error: ${error.message}`);
  }
}
