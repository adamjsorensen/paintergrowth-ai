
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";

type SaveProposalDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposalContent: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  clientAddress?: string;
  jobType: string;
  existingId?: string;
};

const SaveProposalDialog = ({
  open,
  onOpenChange,
  proposalContent,
  clientName,
  clientPhone,
  clientEmail,
  clientAddress,
  jobType,
  existingId,
}: SaveProposalDialogProps) => {
  const [proposalName, setProposalName] = useState(`${clientName || 'New'} Proposal`);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSave = async () => {
    try {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to save proposals.",
          variant: "destructive",
        });
        return;
      }

      setIsSaving(true);
      
      let result;
      
      if (existingId) {
        // Update existing proposal
        result = await supabase
          .from('saved_proposals')
          .update({
            title: proposalName,
            content: proposalContent,
            client_name: clientName,
            client_phone: clientPhone,
            client_email: clientEmail,
            client_address: clientAddress,
            job_type: jobType,
            status: "completed"
          })
          .eq('id', existingId);
      } else {
        // Create new proposal
        result = await supabase
          .from('saved_proposals')
          .insert({
            user_id: user.id,
            title: proposalName,
            content: proposalContent,
            client_name: clientName,
            client_phone: clientPhone,
            client_email: clientEmail,
            client_address: clientAddress,
            job_type: jobType,
            status: "completed"
          });
      }
      
      if (result.error) throw result.error;
      
      toast({
        title: "Proposal saved successfully",
        description: `"${proposalName}" has been saved to your account.`,
      });
      
      onOpenChange(false);
      
      // Navigate to saved proposals page if it's a new save
      if (!existingId) {
        navigate("/saved");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Error saving proposal",
        description: "There was a problem saving your proposal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Proposal</DialogTitle>
          <DialogDescription>
            Give your proposal a name to save it for future reference.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={proposalName}
              onChange={(e) => setProposalName(e.target.value)}
              className="col-span-3"
              autoFocus
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving || !proposalName.trim()}
          >
            {isSaving ? "Saving..." : "Save Proposal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveProposalDialog;
