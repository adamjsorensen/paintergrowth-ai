
import { ReactElement } from "react";
import ContentUploadSection from "./ContentUploadSection";
import ChunkReviewSection from "./ChunkReviewSection";
import DocumentSubmissionForm from "./DocumentSubmissionForm";
import { EnhancedChunk } from "@/hooks/admin/useChunkMetadata";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "@/hooks/admin/useVectorUpload";

interface StepRendererProps {
  currentStep: number;
  manualContent: string;
  handleContentUpdate: (content: string) => void;
  chunks: EnhancedChunk[];
  isProcessing: boolean;
  removeChunk: (id: string) => void;
  updateChunkMetadata: (id: string, metadata: any) => void;
  debugMode: boolean;
  handleDebugModeChange: (enabled: boolean) => void;
  form: UseFormReturn<FormValues>;
  isSubmitting: boolean;
  handleSubmitForm: (values: FormValues) => void;
  acceptedFileTypes: string[];
}

const StepRenderer = ({
  currentStep,
  manualContent,
  handleContentUpdate,
  chunks,
  isProcessing,
  removeChunk,
  updateChunkMetadata,
  debugMode,
  form,
  isSubmitting,
  handleSubmitForm,
  acceptedFileTypes,
}: StepRendererProps): ReactElement | null => {
  switch (currentStep) {
    case 1:
      return (
        <ContentUploadSection 
          onContentChange={handleContentUpdate} 
          initialContent={manualContent}
          acceptedFileTypes={acceptedFileTypes}
        />
      );
    
    case 2:
      return (
        <ChunkReviewSection
          chunks={chunks}
          isProcessing={isProcessing}
          onRemoveChunk={removeChunk}
          onUpdateChunkMetadata={updateChunkMetadata}
          debugMode={debugMode}
        />
      );
    
    case 3:
      return (
        <DocumentSubmissionForm
          form={form}
          chunks={chunks}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmitForm}
        />
      );
    
    default:
      return null;
  }
};

export default StepRenderer;
