
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface SystemPromptPreviewProps {
  previewOutput: string;
}

const SystemPromptPreview: React.FC<SystemPromptPreviewProps> = ({ previewOutput }) => {
  return (
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
  );
};

export default SystemPromptPreview;
