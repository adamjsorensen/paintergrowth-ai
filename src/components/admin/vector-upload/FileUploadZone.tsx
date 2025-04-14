
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, File, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  acceptedFileTypes: string[];
}

const FileUploadZone = ({ onFileSelect, isLoading, acceptedFileTypes }: FileUploadZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const acceptedTypesString = acceptedFileTypes.join(',');
  const acceptedTypesDisplay = acceptedFileTypes
    .map(type => type.replace('.', '').toUpperCase())
    .join(', ');

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 cursor-pointer transition-colors",
        isDragging ? "border-primary bg-primary/10" : "border-muted",
        isLoading && "opacity-50 cursor-not-allowed"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={isLoading ? undefined : handleButtonClick}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        accept={acceptedTypesString}
        disabled={isLoading}
      />
      
      <div className="flex flex-col items-center justify-center space-y-4">
        {isLoading ? (
          <FileText className="h-12 w-12 text-muted-foreground animate-pulse" />
        ) : (
          <Upload className="h-12 w-12 text-muted-foreground" />
        )}
        
        <div className="space-y-2">
          <p className="text-sm font-medium">
            {isLoading ? "Parsing file..." : "Drag & drop or click to upload"}
          </p>
          <p className="text-xs text-muted-foreground">
            Supports {acceptedTypesDisplay}
          </p>
        </div>

        {!isLoading && (
          <Button 
            variant="outline" 
            size="sm" 
            type="button"
            disabled={isLoading}
          >
            Select File
          </Button>
        )}
      </div>
    </div>
  );
};

export default FileUploadZone;
