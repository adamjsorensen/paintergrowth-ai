
import { supabase } from "@/integrations/supabase/client";

export type SavedProposal = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  client_name?: string | null;
  client_phone?: string | null;
  client_email?: string | null;
  client_address?: string | null;
  job_type?: string | null;
  status?: string;
  created_at: string;
  updated_at: string;
  snapshot_html?: string | null;
  snapshot_created_at?: string | null;
};

export async function createProposalSnapshot(
  proposalId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Get the proposal
    const { data: proposal, error: fetchError } = await supabase
      .from('saved_proposals')
      .select('*')
      .eq('id', proposalId)
      .single();

    if (fetchError || !proposal) {
      console.error('Error fetching proposal for snapshot:', fetchError);
      return { success: false, error: 'Could not find proposal' };
    }

    // 2. Generate HTML snapshot
    const snapshot = generateHtmlSnapshot(proposal);

    // 3. Store snapshot
    const { error: updateError } = await supabase
      .from('saved_proposals')
      .update({
        snapshot_html: snapshot,
        snapshot_created_at: new Date().toISOString(),
      })
      .eq('id', proposalId);

    if (updateError) {
      console.error('Error updating proposal snapshot:', updateError);
      return { success: false, error: 'Failed to save snapshot' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in createProposalSnapshot:', error);
    return { success: false, error: 'Unexpected error creating snapshot' };
  }
}

export async function getProposalSnapshot(
  proposalId: string
): Promise<{ snapshot_html: string; snapshot_created_at: string; content: string; client_name?: string; client_phone?: string; client_email?: string; job_type?: string; status?: string; } | null> {
  try {
    const { data, error } = await supabase
      .from('saved_proposals')
      .select('snapshot_html, snapshot_created_at, content, client_name, client_phone, client_email, job_type, status')
      .eq('id', proposalId)
      .single();

    if (error || !data) {
      console.error('Error fetching proposal snapshot:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getProposalSnapshot:', error);
    return null;
  }
}

function generateHtmlSnapshot(proposal: SavedProposal): string {
  // This is a simple implementation. In a real app, you might want to use
  // the same rendering logic as your app with proper components
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${proposal.title || 'Proposal'}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #2563eb; }
        .meta { color: #666; font-size: 0.9em; margin-bottom: 20px; }
        .content { white-space: pre-wrap; }
      </style>
    </head>
    <body>
      <h1>${proposal.title || 'Proposal'}</h1>
      <div class="meta">
        ${proposal.client_name ? `<p><strong>Client:</strong> ${proposal.client_name}</p>` : ''}
        ${proposal.client_phone ? `<p><strong>Phone:</strong> ${proposal.client_phone}</p>` : ''}
        ${proposal.client_email ? `<p><strong>Email:</strong> ${proposal.client_email}</p>` : ''}
        ${proposal.client_address ? `<p><strong>Address:</strong> ${proposal.client_address}</p>` : ''}
        ${proposal.job_type ? `<p><strong>Job Type:</strong> ${proposal.job_type}</p>` : ''}
        <p><strong>Created:</strong> ${new Date(proposal.created_at).toLocaleDateString()}</p>
      </div>
      <div class="content">${proposal.content}</div>
    </body>
    </html>
  `;
}
