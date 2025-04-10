
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Document } from "@/types/supabase";
import { toast } from "@/hooks/use-toast";

export const useDocumentManager = () => {
  const queryClient = useQueryClient();

  // Fetch all documents
  const { data: documents, isLoading, error } = useQuery({
    queryKey: ["all-documents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false });
        
      if (error) {
        console.error("Error fetching documents:", error);
        toast({
          title: "Error loading documents",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
      
      return data as Document[];
    },
  });

  // Delete a document
  const deleteDocument = useMutation({
    mutationFn: async (documentId: string) => {
      const { error } = await supabase
        .from("documents")
        .delete()
        .eq("id", documentId);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-documents"] });
      toast({
        title: "Document deleted",
        description: "The document has been removed successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete document",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return {
    documents,
    isLoading,
    error,
    deleteDocument,
  };
};
