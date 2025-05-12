import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mic, X } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import TranscriptInput from "@/components/audio-transcript/TranscriptInput";

interface TranscriptButtonProps {
  onInformationExtracted: (extractedData: Record<string, any>) => void;
}

const TranscriptButton: React.FC<TranscriptButtonProps> = ({
  onInformationExtracted
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [pendingData, setPendingData] = useState<Record<string, any> | null>(null);

  const handleInformationExtracted = (data: Record<string, any>) => {
    // Store the data and show confirmation dialog
    setPendingData(data);
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmUseData = () => {
    if (pendingData) {
      onInformationExtracted(pendingData);
      setIsConfirmDialogOpen(false);
      setIsDialogOpen(false);
      setPendingData(null);
    }
  };

  const handleCancelUseData = () => {
    setIsConfirmDialogOpen(false);
    // Keep the dialog open so they can try again
  };

  return (
    <>
      <Button 
        variant="outline" 
        className="flex items-center gap-2 w-full sm:w-auto"
        onClick={() => setIsDialogOpen(true)}
      >
        <Mic className="h-4 w-4" />
        <span>Use Voice or Transcript</span>
      </Button>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between">
            <div>
              <DialogTitle>Voice or Transcript Input</DialogTitle>
              <DialogDescription>
                Record audio, upload an audio file, or paste a transcript to automatically extract job details
              </DialogDescription>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsDialogOpen(false)}
              className="absolute right-4 top-4"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          
          <TranscriptInput
            onInformationExtracted={handleInformationExtracted}
            onClose={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Pre-fill form with extracted data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will replace any existing information in the form with the data extracted from your transcript.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelUseData}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmUseData}>
              Yes, Pre-fill Form
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TranscriptButton;