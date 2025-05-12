import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mic, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import AudioTranscriptionInput from "./AudioTranscriptionInput";
import InformationExtractionResult from "./InformationExtractionResult";
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
  const [pendingData, setPendingData] = useState<Record<string, any> | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

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
    
    // Store the data and show confirmation dialog
    setPendingData(processedData);
    setExtractedData(processedData);
    
    // Check if we have valid data with fields
    if (processedData && processedData.fields && Array.isArray(processedData.fields) && processedData.fields.length > 0) {
      setIsConfirmDialogOpen(true);
    } else {
      setError("No useful information could be extracted from the transcript. Please try again with a more detailed transcript or fill in the form manually.");
    }
  };

  const handleConfirmUseData = () => {
    if (pendingData) {
      onInformationExtracted(pendingData);
      setIsConfirmDialogOpen(false);
      onClose();
    }
  };

  const handleCancelUseData = () => {
    setIsConfirmDialogOpen(false);
    // Keep the dialog open so they can try again
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
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <div className="mt-4 flex justify-end">
            <Button variant="outline" size="sm" onClick={handleRetry}>
              Try Again
            </Button>
          </div>
        </Alert>
      )}
      
      {activeStep === "input" ? (
        <AudioTranscriptionInput
          onTranscriptionComplete={handleTranscriptionComplete}
          onInformationExtracted={handleInformationExtracted}
        />
      ) : (
        <InformationExtractionResult
          extractedData={extractedData || {}}
          onAccept={handleAcceptExtractedData}
          onEdit={handleEditManually}
        />
      )}
      
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
    </div>
  );
};

export default TranscriptInput;