
import React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmationDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm 
}: ConfirmationDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Discard Changes?</h2>
          <p>You have unsaved changes. Are you sure you want to discard them?</p>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button variant="destructive" onClick={onConfirm}>Discard</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationDialog;
