
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, Trash2, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

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
        )}

        {/* View Proposal Dialog */}
        <Dialog open={!!viewProposal} onOpenChange={(open) => !open && setViewProposal(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{viewProposal?.title}</DialogTitle>
              <DialogDescription>
                Created {viewProposal && formatDistanceToNow(new Date(viewProposal.created_at), { addSuffix: true })}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <div className="prose prose-blue max-w-none">
                <div className="whitespace-pre-wrap font-sans">
                  {viewProposal?.content}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button variant="outline" onClick={() => setViewProposal(null)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to List
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Delete Confirmation Dialog */}
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
      </div>
    </PageLayout>
  );
};

export default SavedProposals;
