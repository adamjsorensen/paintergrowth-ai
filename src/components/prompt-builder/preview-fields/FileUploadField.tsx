
import React from "react";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";

interface FileUploadFieldProps {
  id: string;
  label: string;
  required?: boolean;
  helpText?: string;
  value: string[];
  onChange: (value: string[]) => void;
}

const FileUploadField: React.FC<FileUploadFieldProps> = ({
  id,
  label,
  required = false,
  helpText,
  value,
  onChange,
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div 
        className="border-2 border-dashed rounded-md p-6 cursor-pointer hover:border-blue-400 transition-colors flex flex-col items-center"
        onClick={() => onChange([...value, `file-${value.length + 1}.jpg`])}
      >
        <Upload className="h-6 w-6 mb-2 text-gray-400" />
        <p className="text-sm text-gray-600">Click to upload or drag files here</p>
      </div>
      {(value?.length > 0) && (
        <div className="text-sm mt-2">
          {(value || []).map((file: string, index: number) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <span>{file}</span>
              <button
                type="button"
                onClick={() => {
                  onChange(value.filter((_, i) => i !== index));
                }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
    </div>
  );
};

export default FileUploadField;
