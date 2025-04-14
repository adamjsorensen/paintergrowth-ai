
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

const VectorUploadForm = () => {
  // State
  const [currentStep, setCurrentStep] = useState(1);
  const [manualContent, setManualContent] = useState("");
  const [debugMode, setDebugMode] = useState(false);

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

  // Event handlers
  const handleNextStep = async () => {
    if (currentStep === 1) {
      const content = manualContent;
      if (!content.trim()) {
        return; // Prevent going to next step if no content
      }
      
      // Update form content and process chunks
      form.setValue("content", content);
      const rawChunks = handleContentChange(content);
      await processChunks(rawChunks);
      setCurrentStep(2);
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

  const handleSubmitForm = (values: any) => {
    // Modify the onSubmit function to handle chunks with metadata
    const enhancedValues = {
      ...values,
      chunks: chunks.map(chunk => ({
        content: chunk.content,
        chunk_metadata: chunk.metadata
      }))
    };
    
    onSubmit(enhancedValues);
    
    // Reset form and state
    resetForm();
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
