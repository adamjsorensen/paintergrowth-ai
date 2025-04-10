
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
      // Call the match-documents Edge Function
      const { data, error } = await supabase.functions.invoke('match-documents', {
        body: { 
          query, 
          threshold, 
          limit 
        }
      });

      if (error) {
        throw new Error(error.message || "Failed to execute search");
      }

      // Properly type and handle the response data
      const results = data as SearchResult[];
      setSearchResults(results);
      setResultCount(results.length);

      if (results.length === 0) {
        toast({
          title: "No matches found",
          description: "Try adjusting your search query or lowering the threshold.",
        });
      } else {
        toast({
          title: "Search completed",
          description: `Found ${results.length} matching document(s)`,
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
