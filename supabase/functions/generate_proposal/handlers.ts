
import { createSupabaseClient, updateProposalStatus, getProposalUserId, fetchPromptTemplate, logGeneration } from "./utils.ts";
import { callOpenRouterAPI, createErrorResponse, createSuccessResponse } from "./api.ts";
import { corsHeaders } from "./utils.ts";

export async function handleGenerateProposal(req) {
  const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
  if (!openRouterApiKey) {
    return createErrorResponse('OpenRouter API key not configured', 500);
  }

  const { prompt_id, field_values, proposal_id, user_email } = await req.json();
  
  if (!prompt_id) {
    return createErrorResponse('Missing prompt_id');
  }

  if (!proposal_id) {
    return createErrorResponse('Missing proposal_id');
  }

  // Create a Supabase client
  const supabase = createSupabaseClient();

  // Update the proposal record to indicate processing
  await updateProposalStatus(supabase, proposal_id, 'generating');

  // Get user ID from proposal record
  const user_id = await getProposalUserId(supabase, proposal_id);

  // Try to fetch the prompt template
  const { data: promptTemplate, error: promptError } = await fetchPromptTemplate(supabase, prompt_id);
  
  if (promptError) {
    console.error('Error fetching prompt template:', promptError);
    
    // Update proposal status to failed
    await updateProposalStatus(
      supabase, 
      proposal_id, 
      'failed', 
      'Failed to fetch prompt template: ' + promptError.message
    );

    // Log the failed generation
    await logGeneration(supabase, {
      user_id,
      user_email: user_email || 'unknown',
      prompt_id,
      proposal_id,
      model_used: 'openai/gpt-4o-mini',
      system_prompt: 'Failed to fetch prompt template',
      final_prompt: 'Generate a detailed proposal based on the information provided.',
      user_input: field_values,
      status: 'failed',
      ai_response: 'Failed to fetch prompt template: ' + promptError.message,
      rag_context: 'Coming soon'
    });
      
    return createErrorResponse('Failed to fetch prompt template: ' + promptError.message, 500);
  }
  
  // If prompt not found but ID is the default placeholder, use a default system prompt
  if (!promptTemplate && prompt_id === "00000000-0000-0000-0000-000000000000") {
    return await handleDefaultPrompt(
      openRouterApiKey, 
      field_values, 
      proposal_id, 
      user_id, 
      user_email, 
      prompt_id, 
      supabase
    );
  }
  
  // If no prompt template and not using the default, return error
  if (!promptTemplate) {
    console.error('No prompt template found for ID:', prompt_id);
    
    // Update proposal status to failed
    await updateProposalStatus(
      supabase,
      proposal_id,
      'failed',
      `Prompt template with ID ${prompt_id} not found`
    );
      
    // Log the failed generation
    await logGeneration(supabase, {
      user_id,
      user_email: user_email || 'unknown',
      prompt_id,
      proposal_id,
      model_used: 'openai/gpt-4o-mini',
      system_prompt: `Prompt template with ID ${prompt_id} not found`,
      final_prompt: 'Generate a detailed proposal based on the information provided.',
      user_input: field_values,
      status: 'failed',
      ai_response: `Prompt template with ID ${prompt_id} not found`,
      rag_context: 'Coming soon'
    });
      
    return createErrorResponse(`Prompt template with ID ${prompt_id} not found`, 404);
  }

  // Process the system prompt - replace all {{field_key}} with actual values
  let systemPrompt = promptTemplate.system_prompt;
  Object.entries(field_values).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    systemPrompt = systemPrompt.replace(regex, String(value));
  });

  console.log('Processed system prompt:', systemPrompt);
  console.log('Starting OpenRouter API call...');

  try {
    // Call OpenRouter API
    const data = await callOpenRouterAPI(systemPrompt, openRouterApiKey);
    console.log('OpenRouter API response received successfully');
    
    const generatedContent = data.choices[0].message.content;

    // Update the proposal record with the generated content
    const { error: updateError } = await updateProposalStatus(supabase, proposal_id, 'completed', generatedContent);

    if (updateError) {
      console.error('Error updating proposal:', updateError);
      
      // Log the failed generation
      await logGeneration(supabase, {
        user_id,
        user_email: user_email || 'unknown',
        prompt_id,
        proposal_id,
        model_used: 'openai/gpt-4o-mini',
        system_prompt: systemPrompt,
        final_prompt: 'Generate a detailed proposal based on the information provided.',
        user_input: field_values,
        status: 'failed',
        ai_response: 'Error updating proposal: ' + updateError.message,
        rag_context: 'Coming soon'
      });
      
      return createErrorResponse('Failed to save generated proposal: ' + updateError.message, 500);
    }

    // Log the successful generation
    await logGeneration(supabase, {
      user_id,
      user_email: user_email || 'unknown',
      prompt_id,
      proposal_id,
      model_used: 'openai/gpt-4o-mini',
      system_prompt: systemPrompt,
      final_prompt: 'Generate a detailed proposal based on the information provided.',
      user_input: field_values,
      status: 'success',
      ai_response: generatedContent,
      rag_context: 'Coming soon'
    });

    console.log('Proposal updated successfully with ID:', proposal_id);

    return createSuccessResponse({ success: true, proposal_id });
  } catch (error) {
    console.error('Error calling OpenRouter API:', error);
    
    // Update proposal status to failed
    await updateProposalStatus(
      supabase,
      proposal_id,
      'failed',
      'Failed to generate content from OpenRouter: ' + error.message
    );
      
    // Log the failed generation
    await logGeneration(supabase, {
      user_id,
      user_email: user_email || 'unknown',
      prompt_id,
      proposal_id,
      model_used: 'openai/gpt-4o-mini',
      system_prompt: systemPrompt,
      final_prompt: 'Generate a detailed proposal based on the information provided.',
      user_input: field_values,
      status: 'failed',
      ai_response: 'Failed to generate content from OpenRouter: ' + error.message,
      rag_context: 'Coming soon'
    });
      
    return createErrorResponse('Failed to generate content from OpenRouter', 500);
  }
}

async function handleDefaultPrompt(
  openRouterApiKey, 
  field_values, 
  proposal_id, 
  user_id, 
  user_email, 
  prompt_id,
  supabase
) {
  console.log('Using default prompt template for placeholder ID');
  
  // Use a simple default system prompt
  let systemPrompt = "You are a professional proposal writer for a painting contractor. " +
    "Create a detailed painting proposal based on the provided information. " +
    "Include an introduction, scope of work, pricing details, and a professional conclusion.";
  
  // Process field values directly
  Object.entries(field_values).forEach(([key, value]) => {
    systemPrompt += `\n- ${key}: ${JSON.stringify(value)}`;
  });

  console.log('Using default system prompt');

  try {
    // Call OpenRouter API
    const data = await callOpenRouterAPI(systemPrompt, openRouterApiKey);
    console.log('OpenRouter API response received successfully');
    
    const generatedContent = data.choices[0].message.content;

    // Update the proposal record with the generated content
    const { error: updateError } = await updateProposalStatus(supabase, proposal_id, 'completed', generatedContent);

    if (updateError) {
      console.error('Error updating proposal:', updateError);
      
      // Log the failed generation
      await logGeneration(supabase, {
        user_id,
        user_email: user_email || 'unknown',
        prompt_id,
        proposal_id,
        model_used: 'openai/gpt-4o-mini',
        system_prompt: systemPrompt,
        final_prompt: 'Generate a detailed proposal based on the information provided.',
        user_input: field_values,
        status: 'failed',
        ai_response: 'Error updating proposal: ' + updateError.message,
        rag_context: 'Coming soon'
      });
      
      return createErrorResponse('Failed to save generated proposal: ' + updateError.message, 500);
    }

    // Log the successful generation
    await logGeneration(supabase, {
      user_id,
      user_email: user_email || 'unknown',
      prompt_id,
      proposal_id,
      model_used: 'openai/gpt-4o-mini',
      system_prompt: systemPrompt,
      final_prompt: 'Generate a detailed proposal based on the information provided.',
      user_input: field_values,
      status: 'success',
      ai_response: generatedContent,
      rag_context: 'Coming soon'
    });

    console.log('Proposal updated successfully with ID:', proposal_id);

    return createSuccessResponse({ success: true, proposal_id });
  } catch (error) {
    console.error('Error calling OpenRouter API:', error);
    
    // Update proposal status to failed
    await updateProposalStatus(
      supabase,
      proposal_id,
      'failed',
      'Failed to generate content from OpenRouter: ' + error.message
    );
      
    // Log the failed generation
    await logGeneration(supabase, {
      user_id,
      user_email: user_email || 'unknown',
      prompt_id,
      proposal_id,
      model_used: 'openai/gpt-4o-mini',
      system_prompt: systemPrompt,
      final_prompt: 'Generate a detailed proposal based on the information provided.',
      user_input: field_values,
      status: 'failed',
      ai_response: 'Failed to generate content from OpenRouter: ' + error.message,
      rag_context: 'Coming soon'
    });
      
    return createErrorResponse('Failed to generate content from OpenRouter', 500);
  }
}
