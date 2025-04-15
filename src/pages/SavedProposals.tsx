import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import PageLayout from "@/components/PageLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card } from "@/components/ui/card";
import { Eye, Trash2, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import EditableProposalContent from "@/components/proposal-viewer/EditableProposalContent";
import SaveProposalDialog from "@/components/SaveProposalDialog";

type Proposal = {
  id: string;
  title: string;
  content: string;
  client_name: string | null;
  job_type: string | null;
  created_at: string;
};

const SavedProposals = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [proposalToDelete, setProposalToDelete] = useState<string | null>(null);
  const [viewProposal, setViewProposal] = useState<Proposal | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchProposals = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('saved_proposals')
        .select("*")
        .order("created_at", { ascending: false }) as { data: Proposal[] | null, error: any };
      
      if (error) throw error;
      
      setProposals(data || []);
    } catch (error) {
      console.error("Error fetching proposals:", error);
      toast({
        title: "Error loading proposals",
        description: "There was a problem loading your saved proposals.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProposals();
    }
  }, [user]);

  const handleDelete = async () => {
    if (!proposalToDelete) return;
    
    try {
      setIsDeleting(true);
      
      const { error } = await supabase
        .from('saved_proposals')
        .delete()
        .eq("id", proposalToDelete);
      
      if (error) throw error;
      
      setProposals(proposals.filter((p) => p.id !== proposalToDelete));
      
      toast({
        title: "Proposal deleted",
        description: "The proposal has been deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting proposal:", error);
      toast({
        title: "Error deleting proposal",
        description: "There was a problem deleting the proposal.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setProposalToDelete(null);
    }
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
    if (!user || !viewProposal?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to save changes",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('saved_proposals')
        .update({
          content: newContent,
          updated_at: new Date(),
        })
        .eq('id', viewProposal.id);

      if (error) throw error;

      setProposals(proposals.map(p => 
        p.id === viewProposal.id 
          ? { ...p, content: newContent }
          : p
      ));
      setViewProposal(prev => prev ? { ...prev, content: newContent } : null);

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

  const handlePrint = (id: string) => {
    window.open(`/proposal/print/${id}`, '_blank');
  };

  return (
    <PageLayout title="Saved Proposals">
      <div className="container mx-auto px-4">
        {isLoading ? (
          <div className="flex justify-center my-12">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : proposals.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-600">No saved proposals</h3>
              <p className="text-sm text-gray-500">
                Generate and save proposals to see them here
              </p>
              <Button className="mt-4" asChild>
                <a href="/generate">Create Your First Proposal</a>
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {proposals.map((proposal) => (
                    <TableRow key={proposal.id}>
                      <TableCell className="font-medium">{proposal.title}</TableCell>
                      <TableCell>{proposal.client_name || 'N/A'}</TableCell>
                      <TableCell className="capitalize">{proposal.job_type || 'N/A'}</TableCell>
                      <TableCell>{formatDistanceToNow(new Date(proposal.created_at), { addSuffix: true })}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => setViewProposal(proposal)}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handlePrint(proposal.id)}>
                          <FileText className="h-4 w-4" />
                          <span className="sr-only">Print</span>
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setProposalToDelete(proposal.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

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
