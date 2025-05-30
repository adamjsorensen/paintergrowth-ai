
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Mail } from "lucide-react";
import LoadingAnimation from "@/components/proposal-generator/LoadingAnimation";
import SaveProposalDialog from "@/components/SaveProposalDialog";
import ProposalNotFound from "@/components/proposal-viewer/ProposalNotFound";
import EditableProposalContent from "@/components/proposal-viewer/EditableProposalContent";
import { useProposalFetch } from "@/hooks/useProposalFetch";
import { supabase } from "@/integrations/supabase/client";
import { shareProposalViaEmail } from "@/utils/emailUtils";
import { useUserProfile } from "@/hooks/useUserProfile";

const ViewProposal = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  
  const { proposal, loading, metadata, setProposal } = useProposalFetch(id, user?.id);
  const { data: userProfile, isLoading: isLoadingUserProfile } = useUserProfile(user?.id);

  // Debug metadata to verify client address is present
  useEffect(() => {
    if (metadata) {
      console.log("ViewProposal - Metadata received:", {
        clientAddress: metadata.clientAddress,
        clientName: metadata.clientName,
        metadataKeys: Object.keys(metadata)
      });
    }
  }, [metadata]);

  const handleCopy = () => {
    if (proposal) {
      navigator.clipboard.writeText(proposal);
      toast({
        title: "Copied to clipboard",
        description: "The proposal has been copied to your clipboard",
      });
    }
  };

  const handleSave = () => {
    setShowSaveDialog(true);
  };

  const handleBack = () => {
    navigate("/generate/proposal");
  };

  const handlePrint = async (): Promise<void> => {
    if (!id) return Promise.resolve();
    
    return new Promise<void>((resolve) => {
      window.open(`/proposal/print/${id}`, '_blank');
      // We need to wait a bit to ensure the window is fully opened
      setTimeout(() => {
        resolve();
      }, 500);
    });
  };

  const handleUpdate = async (newContent: string) => {
    if (!user || !id) {
      toast({
        title: "Error",
        description: "You must be logged in to save changes",
        variant: "destructive",
      });
      return;
    }

    try {
      setProposal(newContent);

      // Update with all metadata fields to preserve them
      const { error } = await supabase
        .from('saved_proposals')
        .update({
          content: newContent,
          updated_at: new Date().toISOString(),
          // Preserve all existing metadata
          client_name: metadata.clientName,
          client_phone: metadata.clientPhone,
          client_email: metadata.clientEmail,
          client_address: metadata.clientAddress,
          job_type: metadata.jobType
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Changes saved",
        description: "Your proposal has been updated",
      });
    } catch (error) {
      console.error("Error updating proposal:", error);
      toast({
        title: "Error saving changes",
        description: "There was a problem updating your proposal",
        variant: "destructive",
      });
    }
  };

  const handleEmailShare = async () => {
    if (!id) return;
    
    await shareProposalViaEmail(id, handlePrint);
  };

  // Combine user profile data with metadata
  const enhancedMetadata = {
    ...metadata,
    preparedBy: userProfile?.full_name || metadata.preparedBy,
    preparedByTitle: userProfile?.job_title || metadata.preparedByTitle,
  };

  if (loading || isLoadingUserProfile) {
    return (
      <PageLayout title="Generating Proposal">
        <LoadingAnimation />
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Your Proposal">
      <div className="container mx-auto max-w-5xl py-8 px-4">
        <div className="flex justify-between items-center mb-4">
          <Button 
            variant="outline"
            onClick={handleBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Form
          </Button>

          {proposal && (
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={handleEmailShare}
              >
                <Mail className="mr-2 h-4 w-4" />
                Share via Email
              </Button>
              <Button
                variant="secondary"
                onClick={() => handlePrint()}
              >
                <FileText className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </div>
          )}
        </div>
        
        {proposal ? (
          <EditableProposalContent 
            proposal={proposal} 
            onCopy={handleCopy} 
            onSave={handleSave} 
            onUpdate={handleUpdate}
          />
        ) : (
          <ProposalNotFound onBack={handleBack} />
        )}
      </div>

      {showSaveDialog && proposal && (
        <SaveProposalDialog
          open={showSaveDialog}
          onOpenChange={setShowSaveDialog}
          proposalContent={proposal}
          clientName={enhancedMetadata.clientName || ""}
          clientPhone={enhancedMetadata.clientPhone || ""}
          clientEmail={enhancedMetadata.clientEmail || ""}
          clientAddress={enhancedMetadata.clientAddress || ""}
          jobType={enhancedMetadata.jobType || ""}
          existingId={id}
        />
      )}
    </PageLayout>
  );
};

export default ViewProposal;
