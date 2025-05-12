import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mic, X } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import AudioTranscriptionInput from "@/components/audio-transcript/AudioTranscriptionInput";
import { processExtractedData } from "./extract-information-utils";

interface TranscriptInputProps {
  onInformationExtracted: (extractedData: Record<string, any>) => void;
  onClose: () => void;
}

const TranscriptInput: React.FC<TranscriptInputProps> = ({
  onInformationExtracted,
  onClose
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [pendingData, setPendingData] = useState<Record<string, any> | null>(null);

  const handleInformationExtracted = (data: Record<string, any>) => {
    console.log("TranscriptInput - Information extracted:", data);
    
    // Log the fields array if it exists
    if (data && data.fields && Array.isArray(data.fields)) {
      console.log("TranscriptInput - Extracted fields:", data.fields.map(f => ({
        name: f.name,
        formField: f.formField,
        value: f.value
      })));
    }
    
    // Process the extracted data to ensure it's in the correct format
    const processedData = processExtractedData(data);
    
    console.log("TranscriptInput - Processed data:", processedData);
    
    // Store the data and show confirmation dialog
    setPendingData(processedData);
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

  // Add handleTranscriptionComplete function
  const handleTranscriptionComplete = (transcript: string) => {
    console.log("Transcription complete:", transcript);
    // The transcript will be handled by the AudioTranscriptionInput component
    // which will then call handleInformationExtracted with the extracted data
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
          
          <AudioTranscriptionInput
            onTranscriptionComplete={handleTranscriptionComplete}
            onInformationExtracted={handleInformationExtracted}
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
}

export default TranscriptInput;