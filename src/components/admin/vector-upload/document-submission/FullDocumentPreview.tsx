
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { EnhancedChunk } from "@/hooks/admin/useChunkMetadata";
import { useState } from "react";

interface FullDocumentPreviewProps {
  chunks: EnhancedChunk[];
}

export const FullDocumentPreview = ({ chunks }: FullDocumentPreviewProps) => {
  const [showPreview, setShowPreview] = useState(false);
  
  if (!chunks.length) return null;

  const fullDocument = chunks.map(c => c.content).join('\n\n');

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch
          id="preview-mode"
          checked={showPreview}
          onCheckedChange={setShowPreview}
        />
        <Label htmlFor="preview-mode">Show full document preview</Label>
      </div>

      {showPreview && (
        <ScrollArea className="h-[400px] w-full rounded-md border p-4">
          <div className="whitespace-pre-wrap text-sm">
            {fullDocument}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};
