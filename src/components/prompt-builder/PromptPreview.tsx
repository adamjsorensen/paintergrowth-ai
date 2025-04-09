
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
      preview = preview.replace(regex, String(value || `[${key}]`));
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
