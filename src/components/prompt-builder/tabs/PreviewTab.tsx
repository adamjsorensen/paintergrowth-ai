
import React from "react";
import PromptPreview from "@/components/prompt-builder/PromptPreview";
import { FieldConfig } from "@/types/prompt-templates";

interface PreviewTabProps {
  templatePrompt: string;
  systemPromptOverride?: string;
  fields: FieldConfig[];
}

const PreviewTab: React.FC<PreviewTabProps> = ({ templatePrompt, systemPromptOverride, fields }) => {
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Preview</h3>
      <p className="text-sm text-muted-foreground mb-6">
        See how the form will appear to users and test your configuration.
      </p>
      
      <PromptPreview 
        templatePrompt={templatePrompt}
        systemPromptOverride={systemPromptOverride}
        fields={fields} 
      />
    </div>
  );
};

export default PreviewTab;
