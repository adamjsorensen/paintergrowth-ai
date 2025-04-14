
import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  currentChunk?: number;
  totalChunks?: number;
}

const LoadingOverlay = ({ currentChunk, totalChunks }: LoadingOverlayProps) => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="max-w-md p-6 text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <h3 className="text-lg font-semibold">🧠 Analyzing your document...</h3>
        <ul className="space-y-2 text-muted-foreground">
          <li>Chunking content</li>
          <li>Extracting AI metadata</li>
          <li>Preparing chunks for review</li>
        </ul>
        {currentChunk !== undefined && totalChunks !== undefined && (
          <p className="text-sm text-muted-foreground">
            Processing {currentChunk} of {totalChunks} sections
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingOverlay;
