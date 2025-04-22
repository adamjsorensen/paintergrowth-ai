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

      // Merge with boilerplate content if specified in values
      let finalContent = generatedText;
      try {
        if (values.includeBoilerplate === true || values.includeBoilerplate === "true") {
          console.log("Merging with boilerplate content");
          
          // Get the selected locale, default to en-US if not provided
          const locale = values.locale || 'en-US';
          
          // Fetch boilerplate texts
          const boilerplateTypes: string[] = [];
          if (values.includeTerms === true || values.includeTerms === "true") {
            boilerplateTypes.push('terms_conditions');
          }
          if (values.includeWarranty === true || values.includeWarranty === "true") {
            boilerplateTypes.push('warranty');
          }
          
          if (boilerplateTypes.length > 0) {
            console.log(`Fetching boilerplate types: ${boilerplateTypes.join(', ')} for locale: ${locale}`);
            
            // Fetch the requested boilerplate texts
            const { data: boilerplateTexts, error: boilerplateError } = await supabase
              .from('boilerplate_texts')
              .select('*')
              .in('type', boilerplateTypes)
              .eq('locale', locale);
              
            if (boilerplateError) {
              console.error('Error fetching boilerplate texts:', boilerplateError);
            } else if (boilerplateTexts && boilerplateTexts.length > 0) {
              console.log(`Found ${boilerplateTexts.length} boilerplate texts`);
              
              // Fetch placeholder defaults
              const { data: placeholderDefaults, error: defaultsError } = await supabase
                .from('placeholder_defaults')
                .select('*');
                
              if (defaultsError) {
                console.error('Error fetching placeholder defaults:', defaultsError);
              }
              
              // Create defaults map
              const defaultsMap: Record<string, string> = {};
              if (placeholderDefaults) {
                placeholderDefaults.forEach((item: any) => {
                  defaultsMap[item.placeholder] = item.default_value;
                });
              }
              
              // Merge boilerplate with generated content
              finalContent = await mergeBoilerplateContent(
                generatedText,
                boilerplateTexts,
                values,
                defaultsMap
              );
              
              console.log("Successfully merged content with boilerplates");
            } else {
              console.log("No matching boilerplate texts found");
            }
          }
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
        ai_response: finalContent,
        rag_context: null
      });

      return createSuccessResponse({ success: true, content: finalContent });
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

/**
 * Merges generated content with boilerplate texts
 */
async function mergeBoilerplateContent(
  generatedContent: string,
  boilerplateTexts: any[],
  values: Record<string, any>,
  defaultPlaceholders: Record<string, string>
): Promise<string> {
  let fullContent = generatedContent;
  
  // Process each boilerplate text
  for (const boilerplate of boilerplateTexts) {
    // Replace placeholders in the boilerplate content
    let processedContent = boilerplate.content;
    
    // Regular expression to match {{placeholder}} pattern
    const placeholderRegex = /{{([^{}]+)}}/g;
    
    // Replace placeholders with values
    processedContent = processedContent.replace(placeholderRegex, (match, placeholder) => {
      // Check if the value exists in provided values
      if (values[placeholder] !== undefined && values[placeholder] !== null) {
        return String(values[placeholder]);
      }
      
      // Check if the value exists in defaults
      if (defaultPlaceholders[placeholder]) {
        return defaultPlaceholders[placeholder];
      }
      
      // Keep the original placeholder if no value is found
      return match;
    });
    
    // Add section heading based on boilerplate type
    let sectionTitle = '';
    switch (boilerplate.type) {
      case 'terms_conditions':
        sectionTitle = '## Terms and Conditions';
        break;
      case 'warranty':
        sectionTitle = '## Warranty';
        break;
      case 'invoice_note':
        sectionTitle = '## Invoice Notes';
        break;
      default:
        sectionTitle = `## ${boilerplate.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}`;
    }
    
    // Append boilerplate content with proper spacing and heading
    fullContent += `\n\n${sectionTitle}\n\n${processedContent}`;
  }
  
  return fullContent;
}
