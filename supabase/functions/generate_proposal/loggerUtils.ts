
/**
 * Utilities for logging proposal generation activities
 */

// Helper function to create log entry object
export function createLogEntry(
  user: any,
  promptId: string,
  proposalId: string,
  aiSettings: any,
  systemPrompt: string,
  finalPrompt: string,
  userInput: any,
  status: string,
  aiResponse: string | null = null
) {
  return {
    user_id: user.id,
    user_email: user.email || 'unknown',
    prompt_id: promptId,
    proposal_id: proposalId,
    model_used: aiSettings.model,
    system_prompt: systemPrompt,
    final_prompt: finalPrompt,
    user_input: userInput,
    status: status,
    ai_response: aiResponse,
    rag_context: null
  };
}
