
import { EnhancedChunk } from "@/hooks/admin/useChunkMetadata";
import ChunkPreview from "@/components/admin/vector-upload/ChunkPreview";
import { Loader2 } from "lucide-react";

interface ChunkReviewSectionProps {
  chunks: EnhancedChunk[];
  isProcessing: boolean;
  onRemoveChunk: (id: string) => void;
  onUpdateChunkMetadata: (id: string, metadata: any) => void;
}

const ChunkReviewSection = ({
  chunks,
  isProcessing,
  onRemoveChunk,
  onUpdateChunkMetadata
}: ChunkReviewSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Content Chunks ({chunks.length})</h3>
        {isProcessing && (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Processing chunks...</span>
          </div>
        )}
      </div>
      
      <div className="max-h-[600px] overflow-y-auto pr-2">
        {chunks.map((chunk, index) => (
          <ChunkPreview
            key={chunk.id}
            chunk={chunk}
            index={index}
            total={chunks.length}
            onDelete={onRemoveChunk}
            onMetadataChange={onUpdateChunkMetadata}
          />
        ))}
      </div>
      
      {chunks.length === 0 && !isProcessing && (
        <div className="text-center p-8 border border-dashed rounded-md">
          <p className="text-muted-foreground">No chunks to display. Go back to add content.</p>
        </div>
      )}
    </div>
  );
};

export default ChunkReviewSection;
