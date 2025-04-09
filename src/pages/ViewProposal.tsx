
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import PageLayout from "@/components/PageLayout";
import LoadingAnimation from "@/components/proposal-generator/LoadingAnimation";
import SaveProposalDialog from "@/components/SaveProposalDialog";
import { ProposalHeader } from "@/components/proposal-viewer/ProposalHeader";
import { ProposalContent } from "@/components/proposal-viewer/ProposalContent";
import { EmptyProposalState } from "@/components/proposal-viewer/EmptyProposalState";
import { useProposalData } from "@/components/proposal-viewer/useProposalData";

const ViewProposal = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const { proposal, loading, metadata } = useProposalData(id, user?.id);

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

  if (loading) {
    return (
      <PageLayout title="Generating Proposal">
        <LoadingAnimation />
      </PageLayout>
    );
  }

  if (!proposal) {
    return (
      <PageLayout title="Proposal Not Found">
        <div className="container mx-auto max-w-5xl py-8 px-4">
          <EmptyProposalState onBack={handleBack} />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Your Proposal">
      <div className="container mx-auto max-w-5xl py-8 px-4">
        <ProposalHeader onBack={handleBack} />
        <ProposalContent 
          proposal={proposal} 
          onCopy={handleCopy} 
          onSave={handleSave} 
        />
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
