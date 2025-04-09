
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Document } from "@/types/supabase";
import { useState } from "react";

export type EmbeddingStatus = {
  [key: string]: 'idle' | 'loading' | 'success' | 'error';
};

export const useVectorDocuments = () => {
  const queryClient = useQueryClient();
  const [embeddingStatus, setEmbeddingStatus] = useState<EmbeddingStatus>({});

  // Fetch recent documents
  const { data: documents, isLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
        
      if (error) {
        console.error("Error fetching documents:", error);
        return [];
      }
      
      return data as Document[];
    },
  });

  // Create embedding for a document
  const generateEmbedding = useMutation({
    mutationFn: async (documentId: string) => {
      setEmbeddingStatus(prev => ({ ...prev, [documentId]: 'loading' }));
      
      try {
        const response = await supabase.functions.invoke('generate-embedding', {
          body: { documentId },
        });
        
        if (!response.data || response.error) {
          throw new Error(response.error?.message || 'Unknown error generating embedding');
        }
        
        setEmbeddingStatus(prev => ({ ...prev, [documentId]: 'success' }));
        return response.data;
      } catch (error) {
        console.error("Error generating embedding:", error);
        setEmbeddingStatus(prev => ({ ...prev, [documentId]: 'error' }));
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    }
  });

  return {
    documents,
    isLoading,
    embeddingStatus,
    generateEmbedding,
  };
};
