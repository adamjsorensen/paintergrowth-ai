
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

export interface EnhancedChunk {
  id: string;
  content: string;
  metadata: any | null;
}

export const useChunkMetadata = (debugMode: boolean = false) => {
  const [chunks, setChunks] = useState<EnhancedChunk[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const processChunks = async (rawChunks: string[]) => {
    if (!rawChunks.length) return;
    
    setIsProcessing(true);
    
    try {
      // Convert raw chunks to enhanced chunks with IDs
      const enhancedChunks: EnhancedChunk[] = rawChunks.map((content) => ({
        id: uuidv4(),
        content,
        metadata: null,
      }));
      
      setChunks(enhancedChunks);
      
      // Process each chunk to generate metadata
      const updatedChunks = [...enhancedChunks];
      
      for (let i = 0; i < enhancedChunks.length; i++) {
        const chunk = enhancedChunks[i];
        try {
          const { data, error } = await supabase.functions.invoke(
            "generate-chunk-metadata",
            { 
              body: { chunk: chunk.content },
              // Add debug parameter if debug mode is enabled
              query: debugMode ? { debug: 'true' } : undefined
            }
          );
          
          if (error) {
            console.error(`Error generating metadata for chunk ${i}:`, error);
            continue;
          }
          
          if (data?.metadata) {
            updatedChunks[i] = {
              ...chunk,
              metadata: data.metadata
            };
          }
        } catch (error) {
          console.error(`Failed to process chunk ${i}:`, error);
        }
      }
      
      setChunks(updatedChunks);
      
    } catch (error) {
      console.error("Error processing chunks:", error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const updateChunkMetadata = (id: string, metadata: any) => {
    setChunks(prev => 
      prev.map(chunk => 
        chunk.id === id ? { ...chunk, metadata } : chunk
      )
    );
  };
  
  const removeChunk = (id: string) => {
    setChunks(prev => prev.filter(chunk => chunk.id !== id));
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
    clearChunks,
  };
};
