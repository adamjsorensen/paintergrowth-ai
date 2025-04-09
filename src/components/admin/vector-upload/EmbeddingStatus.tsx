
import { Check, Loader2, AlertTriangle } from "lucide-react";
import { Document } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import { EmbeddingStatus } from "@/hooks/admin/useVectorDocuments";

interface EmbeddingStatusIndicatorProps {
  doc: Document;
  status: EmbeddingStatus;
  onGenerateEmbedding: (id: string) => void;
  isGenerating: boolean;
}

const EmbeddingStatusIndicator: React.FC<EmbeddingStatusIndicatorProps> = ({ 
  doc, 
  status, 
  onGenerateEmbedding,
  isGenerating
}) => {
  // If the document already has an embedding
  if (doc.embedding) {
    return <span className="inline-flex items-center text-green-600"><Check size={16} className="mr-1" /> Embedded</span>;
  }
  
  // Check the current embedding status
  const currentStatus = status[doc.id];
  
  switch(currentStatus) {
    case 'loading':
      return <span className="inline-flex items-center text-amber-600"><Loader2 size={16} className="mr-1 animate-spin" /> Processing</span>;
    case 'success':
      return <span className="inline-flex items-center text-green-600"><Check size={16} className="mr-1" /> Embedded</span>;
    case 'error':
      return <span className="inline-flex items-center text-red-600"><AlertTriangle size={16} className="mr-1" /> Failed</span>;
    default:
      return (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onGenerateEmbedding(doc.id)}
          disabled={isGenerating}
        >
          Generate Embedding
        </Button>
      );
  }
};

export default EmbeddingStatusIndicator;
