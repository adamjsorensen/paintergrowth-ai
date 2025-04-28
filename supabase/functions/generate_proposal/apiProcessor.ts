
/**
 * Handles API calls and response processing
 */
import { callOpenRouterAPI } from "./api.ts";
import { createLogEntry } from "./loggerUtils.ts";
import { updateProposalStatus, logGeneration } from "./utils.ts";

// Process the API call and handle the response
export async function processApiCall(
  supabase: any,
  proposalId: string,
  user: any,
  promptId: string,
  messages: any[],
  aiSettings: any,
  systemMsg: string,
  bodyMsg: string,
  values: Record<string, any>
) {
  // Get API key from environment
  const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
  if (!openRouterApiKey) {
    console.error('OpenRouter API key not found');
    await updateProposalStatus(supabase, proposalId, 'failed');
    
    // Log the failed generation attempt
    await logGeneration(supabase, createLogEntry(user, promptId, proposalId, aiSettings, systemMsg, bodyMsg, values, 'failed'));
    return { error: 'API key not configured' };
  }

  // Call OpenRouter API
  let response;
  try {
    response = await callOpenRouterAPI(messages, openRouterApiKey, aiSettings);
  } catch (apiError) {
    console.error('OpenRouter API error:', apiError);
    await updateProposalStatus(supabase, proposalId, 'failed');
    
    // Log the failed generation attempt
    await logGeneration(supabase, createLogEntry(user, promptId, proposalId, aiSettings, systemMsg, bodyMsg, values, 'failed'));
    return { error: 'Failed to generate proposal: API error' };
  }

  // Extract and validate the generated text
  const generatedText = response?.choices?.[0]?.message?.content;
  if (!generatedText) {
    console.error('No content in API response');
    await updateProposalStatus(supabase, proposalId, 'failed');
    
    // Log the failed generation attempt
    await logGeneration(supabase, createLogEntry(user, promptId, proposalId, aiSettings, systemMsg, bodyMsg, values, 'failed'));
    return { error: 'Failed to generate proposal: Empty response' };
  }

  return { success: true, content: generatedText };
}
