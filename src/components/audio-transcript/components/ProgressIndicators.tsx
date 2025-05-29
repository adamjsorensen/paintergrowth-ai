
import React from "react";
import { Progress } from "@/components/ui/progress";

interface ProgressIndicatorsProps {
  isUploading: boolean;
  uploadProgress: number;
  isTranscribing: boolean;
  transcriptionProgress: number;
  isExtracting: boolean;
  extractionProgress: number;
}

const ProgressIndicators: React.FC<ProgressIndicatorsProps> = ({
  isUploading,
  uploadProgress,
  isTranscribing,
  transcriptionProgress,
  isExtracting,
  extractionProgress
}) => {
  return (
    <>
      {/* Upload Progress */}
      {(isUploading || uploadProgress > 0 && uploadProgress < 100) && (
        <div className="mt-6 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Uploading Audio</span>
            <span className="text-sm text-muted-foreground">{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}
      
      {/* Transcription Progress */}
      {(isTranscribing || transcriptionProgress > 0 && transcriptionProgress < 100) && (
        <div className="mt-6 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Transcribing Audio</span>
            <span className="text-sm text-muted-foreground">{Math.round(transcriptionProgress)}%</span>
          </div>
          <Progress value={transcriptionProgress} className="h-2" />
        </div>
      )}
      
      {/* Extraction Progress */}
      {(isExtracting || extractionProgress > 0 && extractionProgress < 100) && (
        <div className="mt-6 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Extracting Information</span>
            <span className="text-sm text-muted-foreground">{Math.round(extractionProgress)}%</span>
          </div>
          <Progress value={extractionProgress} className="h-2" />
        </div>
      )}
    </>
  );
};

export default ProgressIndicators;
