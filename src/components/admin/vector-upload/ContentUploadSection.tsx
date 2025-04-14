
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import FileUploadZone from "@/components/admin/vector-upload/FileUploadZone";
import { useFileUpload } from "@/hooks/admin/useFileUpload";

interface ContentUploadSectionProps {
  onContentChange: (content: string) => void;
  initialContent?: string;
  acceptedFileTypes: string[];
}

const ContentUploadSection = ({ 
  onContentChange, 
  initialContent = "", 
  acceptedFileTypes 
}: ContentUploadSectionProps) => {
  const [manualContent, setManualContent] = useState(initialContent);
  
  const { 
    file, 
    parsedContent, 
    isParsingFile, 
    parseError, 
    handleFileSelect, 
    resetFileUpload 
  } = useFileUpload();

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setManualContent(newContent);
    onContentChange(newContent);
  };

  // When file is parsed successfully, update content
  if (parsedContent && parsedContent !== manualContent) {
    setManualContent(parsedContent);
    onContentChange(parsedContent);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Upload File</h3>
        <FileUploadZone 
          onFileSelect={handleFileSelect} 
          isLoading={isParsingFile}
          acceptedFileTypes={acceptedFileTypes}
        />
        {parseError && (
          <p className="mt-2 text-sm text-destructive">{parseError}</p>
        )}
        {file && !parseError && (
          <p className="mt-2 text-sm text-muted-foreground">
            File: {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </p>
        )}
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-2">Content Preview</h3>
        <div className="space-y-2">
          <Textarea
            value={parsedContent || manualContent}
            onChange={handleTextChange}
            className="min-h-[300px] font-mono text-sm"
            placeholder="Paste content here or upload a file"
            disabled={isParsingFile}
          />
          <p className="text-sm text-muted-foreground">
            You can edit this content or paste new text manually.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContentUploadSection;
