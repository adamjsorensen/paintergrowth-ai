
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the OpenAI API key from environment
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not found" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract document ID from request
    const { documentId } = await req.json();
    
    if (!documentId) {
      return new Response(
        JSON.stringify({ error: "Document ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing embedding for document: ${documentId}`);

    // Initialize Supabase client using environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch the document content
    const { data: document, error: fetchError } = await supabase
      .from("documents")
      .select("id, content, embedding")
      .eq("id", documentId)
      .single();

    if (fetchError || !document) {
      console.error("Error fetching document:", fetchError);
      return new Response(
        JSON.stringify({ error: "Document not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if document already has an embedding
    if (document.embedding) {
      return new Response(
        JSON.stringify({ message: "Document already has an embedding" }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for empty content
    if (!document.content || document.content.trim() === '') {
      return new Response(
        JSON.stringify({ error: "Document has no content to embed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call the OpenAI API to generate an embedding
    console.log("Generating embedding via OpenAI API");
    const embeddingResponse = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        input: document.content.trim(),
        model: "text-embedding-3-small"
      })
    });

    if (!embeddingResponse.ok) {
      const errorData = await embeddingResponse.text();
      console.error("OpenAI API error:", errorData);
      return new Response(
        JSON.stringify({ error: "Failed to generate embedding", details: errorData }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const embedData = await embeddingResponse.json();
    const embedding = embedData.data?.[0]?.embedding;

    if (!embedding) {
      console.error("No embedding found in OpenAI response:", embedData);
      return new Response(
        JSON.stringify({ error: "No embedding returned from OpenAI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Store the embedding in the database
    console.log("Storing embedding in database");
    const { error: updateError } = await supabase
      .from("documents")
      .update({ embedding })
      .eq("id", documentId);

    if (updateError) {
      console.error("Error updating document with embedding:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update document with embedding" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Success response
    return new Response(
      JSON.stringify({
        message: "Embedding successfully generated and stored",
        documentId: document.id
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
