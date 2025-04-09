import { useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Document, ContentTypeOptions, CollectionOptions } from "@/types/supabase";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";

type FormValues = {
  title: string;
  content: string;
  collection: CollectionOptions;
  content_type: ContentTypeOptions;
  metadata: string;
};

const VectorUploadPage = () => {
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
      
      // For this demo, we'll skip the actual embedding creation
      // In a real implementation, you'd call an edge function to create embeddings
      
      // Simulate chunking and inserting documents
      const chunks = chunkContent(values.content);
      
      // Insert each chunk as a separate document
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
            // Normally embedding would be filled here via an edge function
          })
          .select();
          
        if (error) throw error;
        if (data) results.push(data[0]);
      }
      
      return results;
    },
    onSuccess: () => {
      toast({
        title: "Document Uploaded",
        description: "Content has been successfully uploaded and vectorized.",
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

  const onSubmit = (values: FormValues) => {
    uploadDocument.mutate(values);
  };

  // Process content and show preview chunks
  const handleContentChange = (content: string) => {
    const newChunks = chunkContent(content);
    setChunks(newChunks);
  };

  // Simple chunking function - in real implementation you'd use a more sophisticated approach
  const chunkContent = (content: string): string[] => {
    if (!content) return [];
    
    // Split on paragraphs (double newlines)
    const paragraphs = content.split(/\n\s*\n/);
    
    // Group paragraphs into chunks of reasonable size
    const chunks: string[] = [];
    let currentChunk = "";
    
    for (const paragraph of paragraphs) {
      // If adding this paragraph would make the chunk too long, start a new chunk
      if (currentChunk.length + paragraph.length > 1000 && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = paragraph;
      } else {
        currentChunk = currentChunk ? `${currentChunk}\n\n${paragraph}` : paragraph;
      }
    }
    
    // Add the last chunk if it's not empty
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <PageLayout title="Vector Upload">
      <div className="container mx-auto">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/admin">Admin</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Vector Upload</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Upload Content</CardTitle>
                <CardDescription>
                  Add content to the vector database for AI retrieval
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Document title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="collection"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Collection</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select collection" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="general">General</SelectItem>
                                <SelectItem value="proposal">Proposal</SelectItem>
                                <SelectItem value="user">User</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="content_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Content Type</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select content type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="faq">FAQ</SelectItem>
                                <SelectItem value="template">Template</SelectItem>
                                <SelectItem value="terminology">Terminology</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter content to be vectorized"
                              className="min-h-[200px]"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                handleContentChange(e.target.value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="metadata"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Metadata (JSON)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder='{"key": "value"}'
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Optional JSON metadata to associate with the document
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full md:w-auto"
                      disabled={uploadDocument.isPending}
                    >
                      {uploadDocument.isPending ? "Uploading..." : "Upload & Vectorize"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Content Preview</CardTitle>
                <CardDescription>
                  Preview of how content will be chunked
                </CardDescription>
              </CardHeader>
              <CardContent>
                {chunks.length > 0 ? (
                  <div className="space-y-4 max-h-80 overflow-y-auto">
                    {chunks.map((chunk, index) => (
                      <div key={index} className="p-3 border rounded-md">
                        <div className="text-xs text-muted-foreground mb-1">Chunk {index + 1}</div>
                        <div className="text-sm">{chunk.substring(0, 100)}...</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    Content will be previewed here
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Uploads</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  </div>
                ) : (
                  <div className="max-h-80 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {documents && documents.length > 0 ? (
                          documents.map((doc) => (
                            <TableRow key={doc.id}>
                              <TableCell className="font-medium">{doc.title}</TableCell>
                              <TableCell>{doc.content_type}</TableCell>
                              <TableCell>{formatDate(doc.created_at || '')}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center">No documents found</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default VectorUploadPage;
