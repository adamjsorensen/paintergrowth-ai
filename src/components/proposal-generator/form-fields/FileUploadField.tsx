
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { FieldConfig } from "@/types/prompt-templates";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Upload, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadFieldProps {
  field: FieldConfig;
  value: string[];
  onChange: (value: string[]) => void;
}

const FileUploadField = ({ field, value = [], onChange }: FileUploadFieldProps) => {
  const { id, label, required, helpText } = field;
  const [files, setFiles] = useState<File[]>([]);

  // This is just a UI demo - real implementation would need actual file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    const newFiles = Array.from(e.target.files);
    setFiles([...files, ...newFiles]);
    
    // In a real implementation, we would upload the files and get URLs
    // For now, we'll just store the file names
    const fileNames = newFiles.map(file => file.name);
    onChange([...value, ...fileNames]);
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    
    const newValue = [...value];
    newValue.splice(index, 1);
    onChange(newValue);
  };

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor={id}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
      </div>
      
      <div className="flex items-center gap-3">
        <Input
          id={id}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          multiple
        />
        <div 
          className={cn(
            "border-2 border-dashed rounded-md p-6 w-full cursor-pointer",
            "hover:border-paintergrowth-300 transition-colors flex flex-col items-center justify-center gap-2",
            "bg-gray-50 text-gray-500"
          )}
          onClick={() => document.getElementById(id)?.click()}
        >
          <Upload size={24} />
          <div className="text-sm font-medium">Click to upload files</div>
          <p className="text-xs text-gray-400">or drag and drop</p>
        </div>
      </div>
      
      {files.length > 0 && (
        <ul className="space-y-2 mt-2">
          {files.map((file, index) => (
            <li 
              key={index} 
              className="flex items-center justify-between bg-gray-50 rounded p-2 text-sm"
            >
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-paintergrowth-500" />
                <span className="truncate max-w-[200px]">{file.name}</span>
              </div>
              <Button 
                type="button" 
                size="icon" 
                variant="ghost" 
                className="h-6 w-6"
                onClick={() => removeFile(index)}
              >
                <X size={16} />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FileUploadField;
