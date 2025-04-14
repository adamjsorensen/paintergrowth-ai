import { useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CollectionOptions, ContentTypeOptions } from "@/types/supabase";

export type FormValues = {
  title: string;
  content: string;
  collection: CollectionOptions;
  content_type: ContentTypeOptions;
  metadata: string;
};

export const useVectorUpload = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [chunks, setChunks] = useState<string[]>([]);

  // Form setup
  const form = useForm<FormValues>({
    defaultValues: {
      title: "",
      content: "",
      collection: "general",
      content_type: "faq",
      metadata: "",
    },
  });

  // Create embedding via edge function and save document
  const uploadDocument = useMutation({
    mutationFn: async (values: FormValues) => {
      // Validate metadata is valid JSON if provided
      let parsedMetadata = {};
      if (values.metadata) {
        try {
          parsedMetadata = JSON.parse(values.metadata);
        } catch (error) {
          throw new Error("Invalid metadata JSON format");
        }
      }

      // Chunk content
      const chunks = chunkContent(values.content);

      const results = [];
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const { data, error } = await supabase
          .from("documents")
          .insert({
            title: `${values.title} (${i + 1}/${chunks.length})`,
            content: chunk,
            collection: values.collection,
            content_type: values.content_type,
            metadata: parsedMetadata,
          })
          .select();

        if (error) throw error;
        if (data) {
          results.push(data[0]);
          try {
            await supabase.functions.invoke("generate-embedding", {
              body: { documentId: data[0].id },
            });
          } catch (error) {
            console.error("Error generating embedding:", error);
          }
        }
      }

      return results;
    },
    onSuccess: () => {
      toast({
        title: "Document Uploaded",
        description:
          "Content has been successfully uploaded and vectorization started.",
      });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      form.reset();
      setChunks([]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to upload document: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleContentChange = (content: string) => {
    const newChunks = chunkContent(content);
    setChunks(newChunks);
  };

  // Improved chunking function with markdown/semantic awareness
  const chunkContent = (content: string): string[] => {
    if (!content) return [];

    const MAX_CHUNK_LENGTH = 1000;
    const paragraphs = content.split(/(?:\n{2,}|\r?\n(?=\s*[*#\-]))/g);

    const chunks: string[] = [];
    let currentChunk = "";

    for (const paragraph of paragraphs) {
      const cleanParagraph = paragraph.trim();
      if (!cleanParagraph) continue;

      if (currentChunk.length + cleanParagraph.length + 2 > MAX_CHUNK_LENGTH) {
        if (currentChunk.length > 0) {
          chunks.push(currentChunk.trim());
          currentChunk = cleanParagraph;
        } else {
          chunks.push(cleanParagraph);
        }
      } else {
        currentChunk = currentChunk
          ? `${currentChunk}\n\n${cleanParagraph}`
          : cleanParagraph;
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  };

  const onSubmit = (values: FormValues) => {
    uploadDocument.mutate(values);
  };

  return {
    form,
    chunks,
    uploadDocument,
    handleContentChange,
    onSubmit,
  };
};
