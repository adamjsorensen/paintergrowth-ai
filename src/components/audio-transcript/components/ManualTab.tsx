
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";

interface ManualTabProps {
  transcript: string;
  onTranscriptChange: (value: string) => void;
  onClear: () => void;
}

const ManualTab: React.FC<ManualTabProps> = ({
  transcript,
  onTranscriptChange,
  onClear
}) => {
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Textarea 
          placeholder="Paste or type your transcript here..."
          className="min-h-[200px]"
          value={transcript}
          onChange={(e) => onTranscriptChange(e.target.value)}
        />
        <p className="text-sm text-muted-foreground">
          Enter the transcript of your conversation with the client or job site walkthrough
        </p>
      </div>
      
      {transcript && (
        <div className="flex justify-end">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClear}
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>
      )}
    </div>
  );
};

export default ManualTab;
