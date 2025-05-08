import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import AudioTranscriptionInput from "./AudioTranscriptionInput";
import InformationExtractionResult from "./InformationExtractionResult";

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
    setTranscript(text);
    setError(null);
  };

  const handleInformationExtracted = (data: Record<string, any>) => {
    setExtractedData(data);
    
    // Check if we have valid data with fields
    if (data && data.fields && Array.isArray(data.fields) && data.fields.length > 0) {
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
    </div>
  );
};

export default TranscriptInput;