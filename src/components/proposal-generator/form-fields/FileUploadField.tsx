
import { useState } from "react";
import { FieldConfig } from "@/types/prompt-templates";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X, Upload, Settings, FileImage } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FileUploadFieldProps {
  field: FieldConfig;
  value: string[];
  onChange: (value: string[]) => void;
  isAdvanced?: boolean;
}

const FileUploadField = ({ field, value, onChange, isAdvanced = false }: FileUploadFieldProps) => {
  const { id, label, required, helpText } = field;
  const [dragActive, setDragActive] = useState(false);
  
  // In a real implementation, you would handle file uploads to a storage service
  // For this demo, we'll simulate the upload by storing file names
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).map(file => file.name);
      onChange([...value, ...newFiles]);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map(file => file.name);
      onChange([...value, ...newFiles]);
    }
  };
  
  const removeFile = (filename: string) => {
    onChange(value.filter(f => f !== filename));
  };

  return (
    <div className="space-y-2" key={id}>
      <div className="flex items-center gap-1 group">
        <Label htmlFor={id} className="inline-flex">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        
        {isAdvanced && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-muted-foreground ml-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                  <Settings className="h-3 w-3" />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Advanced option</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      <div 
        className={`border-2 ${dragActive ? 'border-primary' : 'border-dashed border-gray-300'} 
                  rounded-md p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer ${isAdvanced ? "border-dashed" : ""}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input
          id={id}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        <Label htmlFor={id} className="cursor-pointer flex flex-col items-center justify-center h-24">
          <Upload className="w-8 h-8 text-muted-foreground mb-2" />
          <p className="text-sm font-medium">Drag files here or click to browse</p>
          <p className="text-xs text-muted-foreground mt-1">Upload reference images or documents</p>
        </Label>
      </div>
      
      {value.length > 0 && (
        <div className="space-y-2 mt-2">
          <p className="text-sm font-medium">Uploaded Files</p>
          <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
            {value.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <div className="flex items-center space-x-2 truncate">
                  <FileImage className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs truncate">{file}</span>
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0" 
                  onClick={() => removeFile(file)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
    </div>
  );
};

export default FileUploadField;
