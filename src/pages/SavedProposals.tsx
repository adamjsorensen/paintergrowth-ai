
import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import ProposalsTable from "@/components/proposals/ProposalsTable";
import EmptyProposals from "@/components/proposals/EmptyProposals";
import { useSavedProposals, Proposal } from "@/hooks/useSavedProposals";
import SaveProposalDialog from "@/components/SaveProposalDialog";
import EditableProposalContent from "@/components/proposal-viewer/EditableProposalContent";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const SavedProposals = () => {
  const { proposals, isLoading, deleteProposal, updateProposal } = useSavedProposals();
  const [proposalToDelete, setProposalToDelete] = useState<string | null>(null);
  const [viewProposal, setViewProposal] = useState<Proposal | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!proposalToDelete) return;
    setIsDeleting(true);
    const success = await deleteProposal(proposalToDelete);
    if (success) {
      setProposalToDelete(null);
    }
    setIsDeleting(false);
  };

  const handleCopy = () => {
    if (viewProposal?.content) {
      navigator.clipboard.writeText(viewProposal.content);
      toast({
        title: "Copied to clipboard",
        description: "The proposal has been copied to your clipboard",
      });
    }
  };

  const handleSave = () => {
    setShowSaveDialog(true);
  };

  const handleUpdate = async (newContent: string) => {
    if (!viewProposal?.id) return;
    const success = await updateProposal(viewProposal.id, newContent);
    if (success) {
      setViewProposal(prev => prev ? { ...prev, content: newContent } : null);
    }
  };

  const handlePrint = async (id: string): Promise<void> => {
    return new Promise<void>((resolve) => {
      const printWindow = window.open(`/proposal/print/${id}`, '_blank');
      // We need to wait a bit to ensure the window is fully opened
      setTimeout(() => {
        resolve();
      }, 500);
    });
  };

  if (isLoading) {
    return (
      <PageLayout title="Saved Proposals">
        <div className="container mx-auto px-4">
          <div className="flex justify-center my-12">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Saved Proposals">
      <div className="container mx-auto px-4">
        {proposals.length === 0 ? (
          <EmptyProposals />
        ) : (
          <div className="space-y-6">
            <ProposalsTable
              proposals={proposals}
              onView={setViewProposal}
              onDelete={setProposalToDelete}
              onPrint={handlePrint}
            />
          </div>
        )}

        {viewProposal && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <EditableProposalContent
                proposal={viewProposal.content}
                onCopy={handleCopy}
                onSave={handleSave}
                onUpdate={handleUpdate}
              />
              <div className="p-4 bg-gray-50 border-t flex justify-end">
                <Button variant="outline" onClick={() => setViewProposal(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        <AlertDialog open={!!proposalToDelete} onOpenChange={(open) => !open && setProposalToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the saved proposal.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete} 
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {showSaveDialog && viewProposal && (
          <SaveProposalDialog
            open={showSaveDialog}
            onOpenChange={setShowSaveDialog}
            proposalContent={viewProposal.content}
            clientName={viewProposal.client_name || ""}
            jobType={viewProposal.job_type || ""}
            existingId={viewProposal.id}
          />
        )}
      </div>
    </PageLayout>
  );
};

export default SavedProposals;
