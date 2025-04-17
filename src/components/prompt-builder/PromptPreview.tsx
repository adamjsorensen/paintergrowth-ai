
import { useState } from "react";
import { FieldConfig } from "@/types/prompt-templates";
import FormPreview from "./preview-sections/FormPreview";
import SystemPromptPreview from "./preview-sections/SystemPromptPreview";
import { generatePreviewText } from "@/utils/promptBuilderUtils";

interface PromptPreviewProps {
  templatePrompt: string;
  systemPromptOverride?: string;
  fields: FieldConfig[];
}

const PromptPreview: React.FC<PromptPreviewProps> = ({ 
  templatePrompt, 
  systemPromptOverride,
  fields 
}) => {
  const [values, setValues] = useState<Record<string, any>>({});
  const [previewOutput, setPreviewOutput] = useState<string>("");
  
  const handleInputChange = (fieldId: string, value: any) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
  };
  
  const handleGeneratePreview = () => {
    const preview = generatePreviewText(templatePrompt, values, fields);
    setPreviewOutput(preview);
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <FormPreview 
        fields={fields}
        values={values}
        onValueChange={handleInputChange}
        onGeneratePreview={handleGeneratePreview}
      />
      
      <SystemPromptPreview 
        previewOutput={previewOutput} 
        systemPromptOverride={systemPromptOverride}
      />
    </div>
  );
};

export default PromptPreview;
