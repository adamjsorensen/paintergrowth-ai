
import { useState } from "react";
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

const ViewProposal = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  
  const { proposal, loading, metadata, setProposal } = useProposalFetch(id, user?.id);

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

      const { error } = await supabase
        .from('saved_proposals')
        .update({
          content: newContent,
          updated_at: new Date(),
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

  if (loading) {
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
          clientName={metadata.clientName || ""}
          clientPhone={metadata.clientPhone || ""}
          clientEmail={metadata.clientEmail || ""}
          jobType={metadata.jobType || ""}
          existingId={id}
        />
      )}
    </PageLayout>
  );
};

export default ViewProposal;
