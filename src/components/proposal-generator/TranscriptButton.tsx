import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mic } from "lucide-react";
import TranscriptInput from "@/components/audio-transcript/TranscriptInput";

interface TranscriptButtonProps {
  onInformationExtracted: (extractedData: Record<string, any>) => void;
}

const TranscriptButton: React.FC<TranscriptButtonProps> = ({
  onInformationExtracted
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleInformationExtracted = (data: Record<string, any>) => {
    onInformationExtracted(data);
    setIsDialogOpen(false);
  };

  return (
    <>
      <Button 
        variant="outline" 
        className="flex items-center gap-2"
        onClick={() => setIsDialogOpen(true)}
      >
        <Mic className="h-4 w-4" />
        <span>Use Voice or Transcript</span>
      </Button>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Voice or Transcript Input</DialogTitle>
            <DialogDescription>
              Record audio, upload an audio file, or paste a transcript to automatically extract job details
            </DialogDescription>
          </DialogHeader>
          
          <TranscriptInput
            onInformationExtracted={handleInformationExtracted}
            onClose={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TranscriptButton;