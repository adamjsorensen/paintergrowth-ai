
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface SystemPromptPreviewProps {
  previewOutput: string;
}

const SystemPromptPreview: React.FC<SystemPromptPreviewProps> = ({ previewOutput }) => {
  return (
    <div>
      <h3 className="font-semibold mb-4">System Prompt Preview</h3>
      <Card>
        <CardContent className="pt-6">
          {previewOutput ? (
            <div className="bg-gray-50 p-4 rounded-md min-h-[200px] prose prose-sm max-w-none">
              <ReactMarkdown
                className="font-mono text-sm"
                remarkPlugins={[remarkGfm]}
              >
                {previewOutput}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-md min-h-[200px] font-mono text-sm">
              <span className="text-gray-400">
                Fill in the form and click "Preview System Prompt" to see how it will look
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemPromptPreview;
