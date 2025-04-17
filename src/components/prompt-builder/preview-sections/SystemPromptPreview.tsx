
import { Card, CardContent } from "@/components/ui/card";

interface SystemPromptPreviewProps {
  previewOutput: string;
  systemPromptOverride?: string;
}

const SystemPromptPreview: React.FC<SystemPromptPreviewProps> = ({ 
  previewOutput,
  systemPromptOverride
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Output Preview</h3>
      </div>

      <Card>
        <CardContent className="p-0 overflow-hidden">
          {systemPromptOverride && (
            <div className="p-4 bg-gray-50 border-b">
              <h4 className="text-xs uppercase font-medium mb-2 text-muted-foreground">System Prompt (Override)</h4>
              <div className="bg-white p-3 rounded text-sm font-mono border whitespace-pre-wrap">
                {systemPromptOverride || "No system prompt override"}
              </div>
            </div>
          )}
          
          <div className="p-4">
            <h4 className="text-xs uppercase font-medium mb-2 text-muted-foreground">Template Output</h4>
            <div className="bg-white p-3 rounded text-sm font-mono border whitespace-pre-wrap">
              {previewOutput || "Click 'Preview System Prompt' to see the output"}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemPromptPreview;
