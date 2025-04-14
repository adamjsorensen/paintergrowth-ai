
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "./config.ts";

export const generateEmbedding = async (
  documentId: string, 
  content: string, 
  apiKey: string,
  supabase: ReturnType<typeof createClient>
) => {
  console.log("Generating embedding via OpenAI API");
  const embeddingResponse = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      input: content.trim(),
      model: "text-embedding-3-small"
    })
  });

  if (!embeddingResponse.ok) {
    const errorData = await embeddingResponse.text();
    console.error("OpenAI API error:", errorData);
    throw new Error(`Failed to generate embedding: ${errorData}`);
  }

  const embedData = await embeddingResponse.json();
  const embedding = embedData.data?.[0]?.embedding;

  if (!embedding) {
    console.error("No embedding found in OpenAI response:", embedData);
    throw new Error("No embedding returned from OpenAI");
  }

  // Store the embedding in the database
  console.log("Storing embedding in database");
  const { error: updateError } = await supabase
    .from("documents")
    .update({ embedding })
    .eq("id", documentId);

  if (updateError) {
    console.error("Error updating document with embedding:", updateError);
    throw new Error("Failed to update document with embedding");
  }

  return { documentId, message: "Embedding successfully generated and stored" };
};
