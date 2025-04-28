import { createSupabaseClient, fetchAISettings, updateProposalStatus, logGeneration } from "./utils.ts";
import { callOpenRouterAPI } from "./api.ts";
import { renderPrompt } from "./utils.ts";
import { mergeWithBoilerplate } from "./boilerplateHandler.ts";

export async function processProposalGeneration(
  user: any,
  proposalId: string,
  promptId: string,
  values: Record<string, any>,
  tpl: any
) {
  const supabase = createSupabaseClient();
  const aiSettings = await fetchAISettings(supabase);
  
  try {
    // Process style preferences if present
    const stylePrefs = values._stylePreferences ? processStylePreferences(values._stylePreferences) : 
      processStylePreferences({ length: 50, tone: "professional" });
    
    // Add style preferences to values for template rendering
    const enhancedValues = {
      ...values,
      _styleLength: stylePrefs.lengthInstruction,
      _styleTone: stylePrefs.toneInstruction,
      _styleAdditional: stylePrefs.additionalInstructions
    };
    
    console.log("Style preferences applied:", {
      length: values._stylePreferences?.length,
      tone: values._stylePreferences?.tone,
      processedLength: stylePrefs.lengthInstruction,
      processedTone: stylePrefs.toneInstruction
    });
    
    // Prepare system message with optional override
    const systemMsg = tpl.system_prompt_override ?? aiSettings.default_system_prompt;
    
    // Render the template prompt with values
    const bodyMsg = renderPrompt(tpl.template_prompt, enhancedValues);
    
    // Prepare messages array for OpenRouter
    const messages = [
      { role: "system", content: systemMsg },
      { role: "user",   content: aiSettings.seed_prompt },
      { role: "user",   content: bodyMsg }
    ];

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

    // Extract and save the generated text
    const generatedText = response?.choices?.[0]?.message?.content;
    if (!generatedText) {
      console.error('No content in API response');
      await updateProposalStatus(supabase, proposalId, 'failed');
      
      // Log the failed generation attempt
      await logGeneration(supabase, createLogEntry(user, promptId, proposalId, aiSettings, systemMsg, bodyMsg, values, 'failed'));
      return { error: 'Failed to generate proposal: Empty response' };
    }

    // Merge with boilerplate content if specified in values
    let finalContent = generatedText;
    try {
      if (values.includeBoilerplate === true || values.includeBoilerplate === "true") {
        console.log("Merging with boilerplate content");
        finalContent = await mergeWithBoilerplate(supabase, generatedText, values);
      }
    } catch (mergeError) {
      console.error("Error merging boilerplate:", mergeError);
      // Continue with the original content if merging fails
    }

    // Update proposal with generated content
    const { error: contentError } = await updateProposalStatus(
      supabase, 
      proposalId, 
      'completed', 
      finalContent
    );

    if (contentError) {
      console.error('Failed to update proposal content:', contentError);
      await updateProposalStatus(supabase, proposalId, 'failed');
      return { error: 'Failed to save generated proposal' };
    }

    // Log the successful generation
    await logGeneration(supabase, createLogEntry(user, promptId, proposalId, aiSettings, systemMsg, bodyMsg, values, 'success', finalContent));

    return { success: true, content: finalContent };
  } catch (renderError) {
    console.error('Failed to render template:', renderError);
    await updateProposalStatus(supabase, proposalId, 'failed');
    
    return { error: `Template rendering error: ${renderError.message}` };
  }
}

// Helper function to create log entry object
function createLogEntry(
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

// Moved from utils.ts to keep style preferences processing logic together
export function processStylePreferences(stylePreferences: any) {
  if (!stylePreferences) {
    return {
      lengthInstruction: "Use a standard length with balanced detail.",
      toneInstruction: "Use a professional tone.",
      additionalInstructions: ""
    };
  }

  // Process length preference
  let lengthInstruction = "";
  switch(stylePreferences.length) {
    case 0:
      lengthInstruction = "Make the proposal very concise and focused only on essential points. Minimize paragraph length and eliminate all non-essential details.";
      break;
    case 25:
      lengthInstruction = "Keep the proposal brief, including only key details and main points. Use short paragraphs and concise language.";
      break;
    case 50:
      lengthInstruction = "Use a standard length with balanced detail. Include enough information to be thorough but avoid being overly verbose.";
      break;
    case 75:
      lengthInstruction = "Create a detailed proposal with thorough explanations. Expand on important sections and provide more context where valuable.";
      break;
    case 100:
      lengthInstruction = "Develop a comprehensive proposal with extensive detail and context. Elaborate thoroughly on all sections and provide detailed explanations throughout.";
      break;
    default:
      lengthInstruction = "Use a standard length with balanced detail.";
  }

  // Process tone preference
  let toneInstruction = "";
  switch(stylePreferences.tone) {
    case "friendly":
      toneInstruction = "Use a friendly, approachable tone that builds rapport with the reader. Be conversational while maintaining professionalism.";
      break;
    case "professional":
      toneInstruction = "Use a formal, business-oriented tone throughout the proposal. Maintain professional language and structure.";
      break;
    case "bold":
      toneInstruction = "Use a confident, assertive tone that conveys expertise and certainty. Be direct and emphasize value propositions strongly.";
      break;
    case "chill":
      toneInstruction = "Use a relaxed, casual approach while still being professional. Adopt a conversational style that feels approachable and low-pressure.";
      break;
    default:
      toneInstruction = "Use a professional tone appropriate for business proposals.";
  }

  // Process additional options
  let additionalInstructions = "";
  if (stylePreferences.addUpsells) {
    additionalInstructions += " Include suggestions for value-added services or premium options that could enhance the project.";
  }

  return {
    lengthInstruction,
    toneInstruction,
    additionalInstructions
  };
}
