import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
  const [transcript, setTranscript] = useState<string>("");
  const [extractedData, setExtractedData] = useState<Record<string, any> | null>(null);
  const [activeStep, setActiveStep] = useState<"input" | "review">("input");
  const [error, setError] = useState<string | null>(null);

  const handleTranscriptionComplete = (text: string) => {
    console.log("TranscriptInput - Transcription complete:", text);
    setTranscript(text);
    setError(null);
  };

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
    setExtractedData(processedData);
    
    // Check if we have valid data with fields
    if (processedData && processedData.fields && Array.isArray(processedData.fields) && processedData.fields.length > 0) {
      setActiveStep("review");
      setError(null);
    } else {
      setError("No useful information could be extracted from the transcript. Please try again with a more detailed transcript or fill in the form manually.");
    }
  };

  const handleAcceptExtractedData = () => {
    if (extractedData) {
      onInformationExtracted(extractedData);
      onClose();
    }
  };

  const handleEditManually = () => {
    onClose();
  };

  const handleRetry = () => {
    setActiveStep("input");
    setError(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {error && (
        <AlertDialog open={!!error} onOpenChange={(open) => !open && setError(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Error</AlertDialogTitle>
              <AlertDialogDescription>{error}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={handleRetry}>Try Again</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      
      {activeStep === "input" ? (
        <AudioTranscriptionInput
          onTranscriptionComplete={handleTranscriptionComplete}
          onInformationExtracted={handleInformationExtracted}
        />
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Extracted Information</h3>
          <div className="border rounded-md p-4 bg-muted/20">
            <pre className="text-sm whitespace-pre-wrap">
              {JSON.stringify(extractedData, null, 2)}
            </pre>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleEditManually}>
              Edit Manually
            </Button>
            <Button onClick={handleAcceptExtractedData}>
              Use This Information
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TranscriptInput;