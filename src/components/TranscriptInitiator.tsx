import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mic, X } from "lucide-react";
import TranscriptInput from "@/components/audio-transcript/TranscriptInput";
import { processExtractedData } from "./audio-transcript/extract-information-utils";

interface TranscriptInitiatorProps {
  onInformationExtracted: (extractedData: Record<string, any>) => void;
  onComplete: () => void;
  onSkip: () => void;
}

const TranscriptInitiator: React.FC<TranscriptInitiatorProps> = ({
  onInformationExtracted,
  onComplete,
  onSkip
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(true);

  const handleInformationExtracted = (data: Record<string, any>) => {
    console.log("TranscriptInitiator - Information extracted:", data);
    
    // Log the fields array if it exists
    if (data.fields && Array.isArray(data.fields)) {
      console.log("TranscriptInitiator - Extracted fields:", data.fields.map(f => ({
        name: f.name,
        formField: f.formField,
        value: f.value
      })));
    }
    
    // Process the extracted data to ensure it's in the correct format
    const processedData = processExtractedData(data);
    
    console.log("TranscriptInitiator - Processed data:", processedData);
    
    onInformationExtracted(processedData);
    setIsDialogOpen(false);
    onComplete();
  };

  const handleClose = () => {
    setIsDialogOpen(false);
    onSkip();
  };

  return (
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
            onClick={handleClose}
            className="absolute right-4 top-4"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <TranscriptInput
          onInformationExtracted={handleInformationExtracted}
          onClose={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default TranscriptInitiator;