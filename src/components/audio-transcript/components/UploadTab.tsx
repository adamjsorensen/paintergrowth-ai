
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { FileAudio, Loader2, AlertCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UploadTabProps {
  audioFile: File | null;
  isUploading: boolean;
  uploadProgress: number;
  uploadError: string | null;
  onFileChange: (file: File | null) => void;
  onClear: () => void;
}

const UploadTab: React.FC<UploadTabProps> = ({
  audioFile,
  isUploading,
  uploadProgress,
  uploadError,
  onFileChange,
  onClear
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if file is an audio file
      if (!file.type.startsWith('audio/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload an audio file (MP3, WAV, etc.)",
          variant: "destructive",
        });
        return;
      }
      
      // Check file size (limit to 25MB)
      if (file.size > 25 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Audio file must be less than 25MB",
          variant: "destructive",
        });
        return;
      }
      
      onFileChange(file);
      toast({
        title: "File uploaded",
        description: `${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`,
      });
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4 py-4">
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center ${isUploading ? 'bg-muted/30' : 'hover:bg-muted/50'} cursor-pointer transition-colors`}
        onClick={!isUploading ? triggerFileInput : undefined}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="audio/*"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        {isUploading ? (
          <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
        ) : (
          <FileAudio className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        )}
        <h3 className="text-lg font-medium mb-2">
          {isUploading ? "Uploading Audio File..." : "Upload Audio File"}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {isUploading 
            ? `${Math.round(uploadProgress)}% complete` 
            : "Drag and drop an audio file or click to browse"}
        </p>
        {!isUploading && (
          <Button variant="outline">Select Audio File</Button>
        )}
      </div>
      
      {uploadError && (
        <div className="bg-destructive/10 p-4 rounded-lg flex items-start">
          <AlertCircle className="w-5 h-5 text-destructive mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-destructive">Upload Error</p>
            <p className="text-sm text-destructive/90">{uploadError}</p>
          </div>
        </div>
      )}
      
      {audioFile && !isUploading && (
        <div className="bg-muted/30 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileAudio className="w-5 h-5 mr-2 text-primary" />
              <span className="font-medium">{audioFile.name}</span>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-muted-foreground mr-2">
                {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
              </span>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadTab;
