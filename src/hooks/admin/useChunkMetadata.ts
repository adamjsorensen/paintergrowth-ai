
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ChunkMetadata } from "@/components/admin/vector-upload/ChunkPreview";
import { v4 as uuidv4 } from "uuid";

export interface EnhancedChunk {
  id: string;
  content: string;
  metadata?: ChunkMetadata;
  isProcessing?: boolean;
  error?: string;
}

export const useChunkMetadata = () => {
  const [chunks, setChunks] = useState<EnhancedChunk[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const processChunks = async (rawChunks: string[]) => {
    if (!rawChunks.length) return;

    setIsProcessing(true);
    
    // Initialize with basic chunk data
    const initialChunks: EnhancedChunk[] = rawChunks.map(content => ({
      id: uuidv4(),
      content,
      isProcessing: true
    }));
    
    setChunks(initialChunks);

    // Process each chunk to get metadata
    const enhancedChunks = [...initialChunks];
    
    for (let i = 0; i < enhancedChunks.length; i++) {
      try {
        const { data, error } = await supabase.functions.invoke('generate-chunk-metadata', {
          body: { chunk: enhancedChunks[i].content }
        });

        if (error) {
          console.error("Error generating metadata for chunk:", error);
          enhancedChunks[i] = {
            ...enhancedChunks[i],
            isProcessing: false,
            error: error.message
          };
        } else {
          enhancedChunks[i] = {
            ...enhancedChunks[i],
            metadata: data.metadata,
            isProcessing: false
          };
        }
        
        // Update state after each chunk is processed
        setChunks([...enhancedChunks]);
      } catch (err) {
        console.error("Exception in metadata generation:", err);
        enhancedChunks[i] = {
          ...enhancedChunks[i],
          isProcessing: false,
          error: err instanceof Error ? err.message : "Unknown error"
        };
        setChunks([...enhancedChunks]);
      }
    }

    setIsProcessing(false);
    
    if (enhancedChunks.some(chunk => chunk.error)) {
      toast({
        title: "Some chunks had metadata errors",
        description: "You can still proceed, but some chunks may need manual updates.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Metadata generated",
        description: `Successfully processed ${enhancedChunks.length} chunks.`,
      });
    }

    return enhancedChunks;
  };

  const updateChunkMetadata = (id: string, metadata: ChunkMetadata) => {
    setChunks(prevChunks => 
      prevChunks.map(chunk => 
        chunk.id === id ? { ...chunk, metadata } : chunk
      )
    );
  };

  const removeChunk = (id: string) => {
    setChunks(prevChunks => prevChunks.filter(chunk => chunk.id !== id));
  };

  const clearChunks = () => {
    setChunks([]);
  };

  return {
    chunks,
    isProcessing,
    processChunks,
    updateChunkMetadata,
    removeChunk,
    clearChunks
  };
};
