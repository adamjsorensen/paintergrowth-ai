import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
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

  const handleTranscriptionComplete = (text: string) => {
    setTranscript(text);
  };

  const handleInformationExtracted = (data: Record<string, any>) => {
    setExtractedData(data);
    setActiveStep("review");
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

  return (
    <div className="w-full max-w-4xl mx-auto">
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