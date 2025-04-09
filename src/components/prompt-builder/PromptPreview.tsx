import { useState } from "react";
import { FieldConfig, FieldType } from "@/types/prompt-templates";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Upload, X } from "lucide-react";

interface PromptPreviewProps {
  systemPrompt: string;
  fields: FieldConfig[];
}

const PromptPreview: React.FC<PromptPreviewProps> = ({ systemPrompt, fields }) => {
  const [values, setValues] = useState<Record<string, any>>({});
  const [previewOutput, setPreviewOutput] = useState<string>("");
  
  const handleInputChange = (fieldId: string, value: any) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
  };
  
  const handleGeneratePreview = () => {
    let preview = systemPrompt;
    
    // Replace all field variables with their values
    Object.entries(values).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      const displayValue = Array.isArray(value) ? value.join(", ") : value;
      preview = preview.replace(regex, String(displayValue || `[${key}]`));
    });
    
    // For any fields that haven't been filled, replace with placeholder
    fields.forEach((field) => {
      const regex = new RegExp(`{{${field.id}}}`, "g");
      if (preview.match(regex)) {
        preview = preview.replace(regex, `[${field.id}]`);
      }
    });
    
    setPreviewOutput(preview);
  };
  
  const renderField = (field: FieldConfig) => {
    const { id, label, type, required, helpText, placeholder, options } = field;
    
    switch (type) {
      case "text":
        return (
          <div className="space-y-2" key={id}>
            <Label htmlFor={id}>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={id}
              placeholder={placeholder || ""}
              value={values[id] || ""}
              onChange={(e) => handleInputChange(id, e.target.value)}
              required={required}
            />
            {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
          </div>
        );
      
      case "textarea":
        return (
          <div className="space-y-2" key={id}>
            <Label htmlFor={id}>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={id}
              placeholder={placeholder || ""}
              value={values[id] || ""}
              onChange={(e) => handleInputChange(id, e.target.value)}
              required={required}
            />
            {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
          </div>
        );
      
      case "select":
        return (
          <div className="space-y-2" key={id}>
            <Label htmlFor={id}>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select
              value={values[id] || ""}
              onValueChange={(value) => handleInputChange(id, value)}
            >
              <SelectTrigger id={id}>
                <SelectValue placeholder={placeholder || "Select an option"} />
              </SelectTrigger>
              <SelectContent>
                {options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
          </div>
        );
      
      case "number":
        return (
          <div className="space-y-2" key={id}>
            <Label htmlFor={id}>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={id}
              type="number"
              placeholder={placeholder || ""}
              value={values[id] || ""}
              onChange={(e) => handleInputChange(id, parseFloat(e.target.value))}
              required={required}
            />
            {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
          </div>
        );
      
      case "toggle":
        return (
          <div className="flex justify-between items-center space-x-2 py-2" key={id}>
            <div>
              <Label htmlFor={id}>
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
            </div>
            <Switch
              id={id}
              checked={values[id] || false}
              onCheckedChange={(checked) => handleInputChange(id, checked)}
            />
          </div>
        );
      
      case "date":
        return (
          <div className="space-y-2" key={id}>
            <Label htmlFor={id}>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={id}
              type="date"
              value={values[id] || ""}
              onChange={(e) => handleInputChange(id, e.target.value)}
              required={required}
            />
            {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
          </div>
        );
        
      case "checkbox-group":
        return (
          <div className="space-y-3" key={id}>
            <Label>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
            <div className="grid grid-cols-2 gap-2">
              {options?.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`${id}-${option.value}`}
                    checked={(values[id] || []).includes(option.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handleInputChange(id, [...(values[id] || []), option.value]);
                      } else {
                        handleInputChange(
                          id,
                          (values[id] || []).filter((v: string) => v !== option.value)
                        );
                      }
                    }}
                  />
                  <Label htmlFor={`${id}-${option.value}`} className="text-sm font-normal">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        );
        
      case "multi-select":
        return (
          <div className="space-y-2" key={id}>
            <Label htmlFor={id}>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select
              value="placeholder"
              onValueChange={(value) => {
                const currentValues = values[id] || [];
                if (!currentValues.includes(value)) {
                  handleInputChange(id, [...currentValues, value]);
                }
              }}
            >
              <SelectTrigger id={id}>
                <SelectValue placeholder={placeholder || "Select options..."} />
              </SelectTrigger>
              <SelectContent>
                {options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(values[id]?.length > 0) && (
              <div className="flex flex-wrap gap-1 mt-2">
                {(values[id] || []).map((value: string) => {
                  const option = options?.find((o) => o.value === value);
                  return (
                    <Badge key={value} variant="secondary" className="px-2 py-1">
                      {option?.label || value}
                      <button
                        type="button"
                        className="ml-1"
                        onClick={() => {
                          handleInputChange(
                            id,
                            (values[id] || []).filter((v: string) => v !== value)
                          );
                        }}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}
            {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
          </div>
        );
        
      case "file-upload":
        return (
          <div className="space-y-2" key={id}>
            <Label htmlFor={id}>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div 
              className="border-2 border-dashed rounded-md p-6 cursor-pointer hover:border-blue-400 transition-colors flex flex-col items-center"
              onClick={() => handleInputChange(id, ["file-1.jpg"])}
            >
              <Upload className="h-6 w-6 mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">Click to upload or drag files here</p>
            </div>
            {(values[id]?.length > 0) && (
              <div className="text-sm mt-2">
                {(values[id] || []).map((file: string, index: number) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span>{file}</span>
                    <button
                      type="button"
                      onClick={() => {
                        handleInputChange(
                          id,
                          (values[id] || []).filter((_: string, i: number) => i !== index)
                        );
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
      
      default:
        return null;
    }
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <h3 className="font-semibold mb-4">Form Preview</h3>
        <Card>
          <CardContent className="pt-6 space-y-4">
            {fields
              .sort((a, b) => a.order - b.order)
              .map((field) => renderField(field))
            }
            
            <Button className="w-full mt-4" onClick={handleGeneratePreview}>
              Preview System Prompt
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div>
        <h3 className="font-semibold mb-4">System Prompt Preview</h3>
        <Card>
          <CardContent className="pt-6">
            <div className="bg-gray-50 p-4 rounded-md min-h-[200px] font-mono text-sm whitespace-pre-wrap">
              {previewOutput || (
                <span className="text-gray-400">
                  Fill in the form and click "Preview System Prompt" to see how it will look
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PromptPreview;
