
import React from "react";
import { Check } from "lucide-react";

interface TranscriptPreviewProps {
  transcript: string;
  isTranscribing: boolean;
  transcriptionProgress: number;
}

const TranscriptPreview: React.FC<TranscriptPreviewProps> = ({
  transcript,
  isTranscribing,
  transcriptionProgress
}) => {
  if (!transcript || isTranscribing) {
    return null;
  }

  return (
    <div className="mt-6 space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Transcript</h3>
        {transcriptionProgress === 100 && (
          <div className="flex items-center text-green-600">
            <Check className="w-4 h-4 mr-1" />
            <span className="text-xs">Transcription complete</span>
          </div>
        )}
      </div>
      <div className="bg-muted/30 p-4 rounded-lg max-h-[200px] overflow-y-auto">
        <p className="text-sm whitespace-pre-wrap">{transcript}</p>
      </div>
    </div>
  );
};

export default TranscriptPreview;
