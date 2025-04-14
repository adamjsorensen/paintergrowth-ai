import { useState } from "react";
import { useVectorUpload } from "@/hooks/admin/useVectorUpload";
import { useChunkMetadata } from "@/hooks/admin/useChunkMetadata";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import StepIndicator from "@/components/admin/vector-upload/StepIndicator";
import StepRenderer from "@/components/admin/vector-upload/StepRenderer";
import FormNavigationButtons from "@/components/admin/vector-upload/FormNavigationButtons";
import { ACCEPTED_FILE_TYPES, UPLOAD_STEPS } from "@/components/admin/vector-upload/uploadConstants";
import { Bug } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import LoadingOverlay from "./LoadingOverlay";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const VectorUploadForm = () => {
  // State
  const [currentStep, setCurrentStep] = useState(1);
  const [manualContent, setManualContent] = useState("");
  const [debugMode, setDebugMode] = useState(false);
  const [isProcessingContent, setIsProcessingContent] = useState(false);
  const [currentChunk, setCurrentChunk] = useState<number>();
  const [totalChunks, setTotalChunks] = useState<number>();

  // Hooks
  const { form, uploadDocument, handleContentChange, onSubmit } = useVectorUpload();
  const { 
    chunks, 
    isProcessing, 
    processChunks, 
    updateChunkMetadata, 
    removeChunk, 
    clearChunks 
  } = useChunkMetadata(debugMode);

  const navigate = useNavigate();
  const { toast } = useToast();

  // Event handlers
  const handleNextStep = async () => {
    if (currentStep === 1) {
      const content = manualContent;
      if (!content.trim()) {
        return;
      }
      
      setIsProcessingContent(true);
      try {
        form.setValue("content", content);
        const rawChunks = handleContentChange(content);
        setTotalChunks(rawChunks.length);
        
        for (let i = 0; i < rawChunks.length; i++) {
          setCurrentChunk(i + 1);
          await processChunks([rawChunks[i]]);
        }
        
        setCurrentStep(2);
      } catch (error) {
        toast({
          title: "Error processing content",
          description: "Failed to analyze document. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsProcessingContent(false);
        setCurrentChunk(undefined);
        setTotalChunks(undefined);
      }
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleContentUpdate = (content: string) => {
    setManualContent(content);
  };

  const handleDebugModeChange = (enabled: boolean) => {
    setDebugMode(enabled);
  };

  const handleSubmitForm = async (values: any) => {
    try {
      const enhancedValues = {
        ...values,
        chunks: chunks.map(chunk => ({
          content: chunk.content,
          chunk_metadata: chunk.metadata
        }))
      };
      
      await onSubmit(enhancedValues);
      
      toast({
        title: "Success!",
        description: "Document saved and embeddings generated successfully.",
      });
      
      navigate("/admin/vector-upload/manage");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save document. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setManualContent("");
    clearChunks();
    form.reset();
  };

  // Calculate if Next button should be disabled
  const isNextDisabled = 
    (currentStep === 1 && !manualContent.trim()) ||
    (currentStep === 2 && chunks.length === 0);

  return (
    <Card>
      {isProcessingContent && (
        <LoadingOverlay currentChunk={currentChunk} totalChunks={totalChunks} />
      )}
      
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Upload Content</CardTitle>
            <CardDescription>
              Add content to the vector database for AI retrieval
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Bug className="h-4 w-4 text-amber-500" />
            <span className="text-sm">Debug Mode</span>
            <Switch 
              checked={debugMode} 
              onCheckedChange={handleDebugModeChange}
              aria-label="Toggle debug mode"
            />
          </div>
        </div>
        <div className="mt-4">
          <StepIndicator currentStep={currentStep} steps={UPLOAD_STEPS} />
        </div>
      </CardHeader>
      
      <CardContent>
        <StepRenderer
          currentStep={currentStep}
          manualContent={manualContent}
          handleContentUpdate={handleContentUpdate}
          chunks={chunks}
          isProcessing={isProcessing}
          removeChunk={removeChunk}
          updateChunkMetadata={updateChunkMetadata}
          debugMode={debugMode}
          handleDebugModeChange={handleDebugModeChange}
          form={form}
          isSubmitting={uploadDocument.isPending}
          handleSubmitForm={handleSubmitForm}
          acceptedFileTypes={ACCEPTED_FILE_TYPES}
        />
      </CardContent>
      
      <CardFooter>
        <FormNavigationButtons
          currentStep={currentStep}
          handlePrevStep={handlePrevStep}
          handleNextStep={handleNextStep}
          isNextDisabled={isNextDisabled}
          isProcessing={isProcessing}
          isSubmitting={uploadDocument.isPending}
        />
      </CardFooter>
    </Card>
  );
};

export default VectorUploadForm;
