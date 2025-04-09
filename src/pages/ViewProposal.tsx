
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import LoadingAnimation from "@/components/proposal-generator/LoadingAnimation";
import SaveProposalDialog from "@/components/SaveProposalDialog";
import ProposalContent from "@/components/proposal-viewer/ProposalContent";
import ProposalNotFound from "@/components/proposal-viewer/ProposalNotFound";
import { useProposalFetch } from "@/hooks/useProposalFetch";
import { supabase } from "@/integrations/supabase/client";

const ViewProposal = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  
  // Use our custom hook for fetching proposal data
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

  const handleSave = async (updatedProposal?: string) => {
    if (updatedProposal) {
      try {
        const { error } = await supabase
          .from('saved_proposals')
          .update({ content: updatedProposal })
          .eq('id', id);
          
        if (error) throw error;
        
        // Update local state with the new content
        setProposal(updatedProposal);
        
        toast({
          title: "Proposal updated",
          description: "Changes have been saved successfully",
        });
      } catch (error) {
        console.error("Failed to update proposal:", error);
        toast({
          title: "Failed to save changes",
          description: "Please try again",
          variant: "destructive",
        });
      }
    } else {
      setShowSaveDialog(true);
    }
  };

  const handleBack = () => {
    navigate("/generate/proposal");
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
        <Button 
          variant="outline" 
          className="mb-4"
          onClick={handleBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Form
        </Button>
        
        {proposal ? (
          <ProposalContent 
            proposal={proposal} 
            onCopy={handleCopy} 
            onSave={handleSave} 
          />
        ) : (
          <ProposalNotFound onBack={handleBack} />
        )}
      </div>

      {/* Save Dialog */}
      {showSaveDialog && proposal && (
        <SaveProposalDialog
          open={showSaveDialog}
          onOpenChange={setShowSaveDialog}
          proposalContent={proposal}
          clientName={metadata.clientName || ""}
          jobType={metadata.jobType || ""}
          existingId={id}
        />
      )}
    </PageLayout>
  );
};

export default ViewProposal;
