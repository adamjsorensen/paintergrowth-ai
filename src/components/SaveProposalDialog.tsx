
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

type SaveProposalDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposalContent: string;
  clientName: string;
};

const SaveProposalDialog = ({
  open,
  onOpenChange,
  proposalContent,
  clientName,
}: SaveProposalDialogProps) => {
  const [proposalName, setProposalName] = useState(`${clientName} Proposal`);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Simulate saving to database
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Proposal saved successfully",
        description: `"${proposalName}" has been saved to your account.`,
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error saving proposal",
        description: "There was a problem saving your proposal. Please try again.",
        variant: "destructive",
      });
      console.error("Save error:", error);
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
