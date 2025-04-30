
import { createSupabaseClient, fetchAISettings, updateProposalStatus, logGeneration, renderPrompt } from "./utils.ts";
import { processApiCall } from "./apiProcessor.ts";
import { processStylePreferences } from "./stylePreferences.ts";
import { createLogEntry } from "./loggerUtils.ts";
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
      _styleAdditional: stylePrefs.additionalInstructions,
      // Ensure user profile data is available
      preparedBy: values.preparedBy || user.email || "Estimator",
      preparedByTitle: values.preparedByTitle || ""
    };
    
    console.log("Style preferences applied:", {
      length: values._stylePreferences?.length,
      tone: values._stylePreferences?.tone,
      processedLength: stylePrefs.lengthInstruction,
      processedTone: stylePrefs.toneInstruction,
      preparedBy: enhancedValues.preparedBy,
      preparedByTitle: enhancedValues.preparedByTitle
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

    // Process API call and get response
    const apiResult = await processApiCall(
      supabase,
      proposalId,
      user,
      promptId,
      messages,
      aiSettings,
      systemMsg,
      bodyMsg,
      values
    );

    if ('error' in apiResult) {
      return apiResult;
    }

    // Merge with boilerplate content if specified in values
    let finalContent = apiResult.content;
    try {
      if (values.includeBoilerplate === true || values.includeBoilerplate === "true") {
        console.log("Merging with boilerplate content");
        finalContent = await mergeWithBoilerplate(supabase, apiResult.content, values);
      }
    } catch (mergeError) {
      console.error("Error merging boilerplate:", mergeError);
      // Continue with the original content if merging fails
    }

    // Update proposal with generated content and additional field values
    const updateData: Record<string, any> = {
      status: 'completed',
      content: finalContent
    };
    
    // Store the projectAddress as client_address if present
    if (values.projectAddress) {
      updateData.client_address = values.projectAddress;
      console.log("Setting client address:", values.projectAddress);
    }
    
    const { error: contentError } = await supabase
      .from('saved_proposals')
      .update(updateData)
      .eq('id', proposalId);

    if (contentError) {
      console.error('Failed to update proposal content:', contentError);
      await updateProposalStatus(supabase, proposalId, 'failed');
      return { error: 'Failed to save generated proposal' };
    }

    // Log the successful generation
    await logGeneration(
      supabase, 
      createLogEntry(user, promptId, proposalId, aiSettings, systemMsg, bodyMsg, values, 'success', finalContent)
    );

    return { success: true, content: finalContent };
  } catch (renderError) {
    console.error('Failed to render template:', renderError);
    await updateProposalStatus(supabase, proposalId, 'failed');
    
    return { error: `Template rendering error: ${renderError.message}` };
  }
}
