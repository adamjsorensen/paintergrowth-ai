
import { supabase } from "@/integrations/supabase/client";
import { CompanyProfile } from "@/types/supabase";

// Define a more complete type for the proposal data
type SavedProposal = {
  id: string;
  content: string;
  client_name?: string | null;
  client_phone?: string | null; 
  client_email?: string | null;
  job_type?: string | null;
  status?: string;
  snapshot_html?: string | null;
  snapshot_created_at?: string | null;
};

/**
 * Checks if a proposal has a snapshot, and creates one if it doesn't
 * @param proposalId The ID of the proposal to check/create snapshot for
 * @param proposalContent The proposal content (if available)
 * @param metadata Proposal metadata for rendering
 * @param companyProfile Company profile data for rendering
 * @returns The snapshot HTML or null if creation failed
 */
export const getOrCreateProposalSnapshot = async (
  proposalId: string,
  proposalContent?: string | null,
  metadata?: Record<string, any>,
  companyProfile?: CompanyProfile | null
): Promise<string | null> => {
  try {
    // First check if the proposal already has a snapshot
    const { data: proposal, error: fetchError } = await supabase
      .from("saved_proposals")
      .select("snapshot_html, snapshot_created_at, content, client_name, client_phone, client_email, job_type, status")
      .eq("id", proposalId)
      .single();
      
    if (fetchError) {
      console.error("Error fetching proposal snapshot:", fetchError);
      return null;
    }
    
    // Cast the proposal to our defined type to ensure proper type checking
    const typedProposal = proposal as SavedProposal;
    
    // If the proposal already has a snapshot, return it
    if (typedProposal.snapshot_html) {
      return typedProposal.snapshot_html;
    }
    
    // If no content was provided, use the one from the proposal
    const content = proposalContent || typedProposal.content;
    if (!content) {
      console.error("No proposal content available for snapshot creation");
      return null;
    }

    // We need to fetch company profile and metadata if not provided
    let fullMetadata = metadata;
    let fullCompanyProfile = companyProfile;

    if (!fullMetadata || !fullCompanyProfile) {
      // Fetch company profile if not provided
      if (!fullCompanyProfile) {
        const { data: profileData } = await supabase
          .from("company_profiles")
          .select("*")
          .single();
        fullCompanyProfile = profileData;
      }

      // Build metadata from proposal data if not provided
      if (!fullMetadata) {
        fullMetadata = {
          clientName: typedProposal.client_name,
          clientPhone: typedProposal.client_phone,
          clientEmail: typedProposal.client_email,
          jobType: typedProposal.job_type,
          status: typedProposal.status
        };
      }
    }

    // Create the snapshot HTML - this is a simplified version
    // In a real implementation, you would use renderToString from React DOM Server
    // with the actual PrintableProposal component
    const snapshotHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${fullMetadata?.clientName || 'Proposal'} - ${fullCompanyProfile?.business_name || 'Company'}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; }
            .container { max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { margin-bottom: 30px; padding-bottom: 15px; border-bottom: 1px solid #e2e8f0; }
            .proposal-content { margin-top: 30px; }
            h1, h2, h3, h4 { margin-top: 1.5em; margin-bottom: 0.5em; }
            p { margin-top: 0; margin-bottom: 1em; }
            .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 0.875rem; color: #64748b; }
          </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${fullMetadata?.clientName || 'Client'} - Proposal</h1>
            <p>Prepared by ${fullCompanyProfile?.business_name || 'Company'}</p>
            <p>Date: ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="proposal-content">
            ${content}
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ${fullCompanyProfile?.business_name || 'Company'} - All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Save the snapshot to the database
    const { error: updateError } = await supabase
      .from("saved_proposals")
      .update({
        snapshot_html: snapshotHtml,
        snapshot_created_at: new Date().toISOString() // Convert Date to string
      })
      .eq("id", proposalId);

    if (updateError) {
      console.error("Error saving proposal snapshot:", updateError);
      return null;
    }

    return snapshotHtml;
  } catch (error) {
    console.error("Error in getOrCreateProposalSnapshot:", error);
    return null;
  }
};

/**
 * Creates a public URL for accessing a proposal snapshot
 * @param proposalId The ID of the proposal
 * @returns The public URL
 */
export const getPublicProposalUrl = (proposalId: string): string => {
  // Return the public URL for the proposal
  return `${window.location.origin}/p/${proposalId}`;
};
