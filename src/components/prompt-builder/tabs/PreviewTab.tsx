
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import PromptPreview from "@/components/prompt-builder/PromptPreview";
import { FieldConfig } from "@/types/prompt-templates";

interface PreviewTabProps {
  systemPrompt: string;
  fields: FieldConfig[];
}

const PreviewTab: React.FC<PreviewTabProps> = ({ systemPrompt, fields }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview</CardTitle>
        <CardDescription>Preview how the form will look to users</CardDescription>
      </CardHeader>
      <CardContent>
        <PromptPreview 
          systemPrompt={systemPrompt}
          fields={fields} 
        />
      </CardContent>
    </Card>
  );
};

export default PreviewTab;
