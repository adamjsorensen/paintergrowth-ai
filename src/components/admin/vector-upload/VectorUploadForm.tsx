
import { useState } from "react";
import { useVectorUpload } from "@/hooks/admin/useVectorUpload";
import { useChunkMetadata } from "@/hooks/admin/useChunkMetadata";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StepIndicator from "@/components/admin/vector-upload/StepIndicator";
import ContentUploadSection from "@/components/admin/vector-upload/ContentUploadSection";
import ChunkReviewSection from "@/components/admin/vector-upload/ChunkReviewSection";
import DocumentSubmissionForm from "@/components/admin/vector-upload/DocumentSubmissionForm";
import { ArrowRight } from "lucide-react";

const ACCEPTED_FILE_TYPES = [
  ".txt", ".doc", ".docx", ".csv", ".xlsx", ".md", ".json", ".css"
];

const UPLOAD_STEPS = [
  { id: 1, name: "Upload Content" },
  { id: 2, name: "Review Chunks" },
  { id: 3, name: "Submit" },
];

const VectorUploadForm = () => {
  // State
  const [currentStep, setCurrentStep] = useState(1);
  const [manualContent, setManualContent] = useState("");

  // Hooks
  const { form, uploadDocument, handleContentChange, onSubmit } = useVectorUpload();
  const { 
    chunks, 
    isProcessing, 
    processChunks, 
    updateChunkMetadata, 
    removeChunk, 
    clearChunks 
  } = useChunkMetadata();

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

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <ContentUploadSection 
            onContentChange={handleContentUpdate} 
            initialContent={manualContent}
            acceptedFileTypes={ACCEPTED_FILE_TYPES}
          />
        );
      
      case 2:
        return (
          <ChunkReviewSection
            chunks={chunks}
            isProcessing={isProcessing}
            onRemoveChunk={removeChunk}
            onUpdateChunkMetadata={updateChunkMetadata}
          />
        );
      
      case 3:
        return (
          <DocumentSubmissionForm
            form={form}
            chunks={chunks}
            isSubmitting={uploadDocument.isPending}
            onSubmit={handleSubmitForm}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Content</CardTitle>
        <CardDescription>
          Add content to the vector database for AI retrieval
        </CardDescription>
        <div className="mt-4">
          <StepIndicator currentStep={currentStep} steps={UPLOAD_STEPS} />
        </div>
      </CardHeader>
      
      <CardContent>
        {renderStepContent()}
      </CardContent>
      
      <CardFooter className="flex justify-between border-t p-6">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevStep}
          disabled={currentStep === 1 || uploadDocument.isPending || isProcessing}
        >
          Back
        </Button>
        
        {currentStep < 3 ? (
          <Button
            type="button"
            onClick={handleNextStep}
            disabled={
              (currentStep === 1 && !manualContent.trim()) ||
              isProcessing ||
              (currentStep === 2 && chunks.length === 0)
            }
            className="gap-1"
          >
            Next <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  );
};

export default VectorUploadForm;
