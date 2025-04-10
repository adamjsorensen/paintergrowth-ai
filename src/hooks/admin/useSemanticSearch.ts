
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export type SearchResult = {
  id: string;
  title: string;
  content: string;
  similarity: number;
};

export const useSemanticSearch = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [resultCount, setResultCount] = useState(0);

  const runSemanticSearch = async (query: string, threshold: number, limit: number) => {
    setIsSearching(true);
    setSearchResults([]);
    
    try {
      // Step 1: Generate embedding from OpenAI
      const embeddingResponse = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          input: query,
          model: "text-embedding-3-small"
        })
      });

      if (!embeddingResponse.ok) {
        const error = await embeddingResponse.json();
        throw new Error(error.error?.message || "Failed to generate embedding");
      }

      const embeddingData = await embeddingResponse.json();
      const embedding = embeddingData.data?.[0]?.embedding;

      if (!embedding) {
        throw new Error("No embedding generated");
      }

      // Step 2: Call Supabase RPC function for similarity search
      const { data, error } = await supabase.rpc('match_documents', {
        query_embedding: embedding,
        match_threshold: threshold,
        match_count: limit
      });

      if (error) {
        throw new Error(error.message);
      }

      setSearchResults(data || []);
      setResultCount(data?.length || 0);

      if (data?.length === 0) {
        toast({
          title: "No matches found",
          description: "Try adjusting your search query or lowering the threshold.",
        });
      } else {
        toast({
          title: "Search completed",
          description: `Found ${data.length} matching document(s)`,
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Search failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return {
    isSearching,
    searchResults,
    resultCount,
    runSemanticSearch
  };
};
