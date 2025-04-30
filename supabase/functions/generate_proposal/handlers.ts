
import { createErrorResponse, createSuccessResponse } from "./api.ts";
import { createSupabaseClient, updateProposalStatus, fetchPromptTemplate } from "./utils.ts";
import { processProposalGeneration } from "./contentProcessor.ts";

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

    // Additionally update client_phone, client_email, and client_address if they exist in values
    if (values.clientPhone || values.clientEmail || values.projectAddress) {
      const updateData: Record<string, string> = {};
      if (values.clientPhone) updateData.client_phone = values.clientPhone as string;
      if (values.clientEmail) updateData.client_email = values.clientEmail as string;
      if (values.projectAddress) updateData.client_address = values.projectAddress as string;

      console.log("Updating client contact info:", updateData);

      const { error: clientDataError } = await supabase
        .from('saved_proposals')
        .update(updateData)
        .eq('id', proposalId);

      if (clientDataError) {
        console.error('Failed to update client contact info:', clientDataError);
        // Continue with generation as this is not critical
      } else {
        console.log('Successfully updated client contact info');
      }
    }

    // Fetch prompt template
    const { data: tpl, error: promptError } = await fetchPromptTemplate(supabase, promptId);

    if (promptError || !tpl) {
      console.error('Failed to fetch prompt template:', promptError);
      await updateProposalStatus(supabase, proposalId, 'failed');
      return createErrorResponse('Failed to fetch prompt template');
    }

    // Process the proposal generation
    const result = await processProposalGeneration(user, proposalId, promptId, values, tpl);
    
    if ('error' in result) {
      return createErrorResponse(result.error);
    }
    
    return createSuccessResponse(result);
    
  } catch (error) {
    console.error('Error in generate_proposal function:', error);
    return createErrorResponse(`Internal server error: ${error.message}`);
  }
}
