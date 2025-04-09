
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { supabase, Document as DocumentType } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";

interface DocumentFormValues {
  title: string;
  content: string;
  collection: string;
  content_type: string;
}

interface Document {
  id: string;
  title: string;
  content: string;
  collection: string;
  content_type: string;
  created_at: string;
}

// This would be an edge function in production to handle embedding generation
const getEmbedding = async (text: string) => {
  // Placeholder implementation - in production, this would call OpenAI API
  // to generate a real embedding using the text-embedding-3-small model
  console.log("Getting embedding for text of length:", text.length);
  
  // Return a mock 1536-dimensional vector
  return Array(1536).fill(0).map(() => Math.random() * 2 - 1);
};

const VectorUpload = () => {
  const [previewChunks, setPreviewChunks] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const form = useForm<DocumentFormValues>({
    defaultValues: {
      title: "",
      content: "",
      collection: "general",
      content_type: "faq"
    }
  });

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select("id, title, content, collection, content_type, created_at")
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      return (data || []) as Document[];
    }
  });

  const createDocumentMutation = useMutation({
    mutationFn: async (values: DocumentFormValues) => {
      try {
        // Get embedding for the document
        const embedding = await getEmbedding(values.content);
        
        // Insert document with embedding
        const { data, error } = await supabase
          .from('documents')
          .insert({
            title: values.title,
            content: values.content,
            collection: values.collection,
            content_type: values.content_type,
            embedding: embedding,
            metadata: { chunks: previewChunks.length }
          })
          .select();
          
        if (error) throw error;
        
        return data[0];
      } catch (error) {
        console.error("Error creating document:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Document uploaded successfully");
      form.reset();
      setPreviewChunks([]);
    },
    onError: () => {
      toast.error("Failed to upload document");
    }
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('documents').delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Document deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete document");
    }
  });

  // Function to split text into chunks based on paragraphs
  const generateChunks = (text: string) => {
    if (!text) return [];
    
    // Split by paragraphs or headings
    const chunks = text
      .split(/\n\s*\n/) // Split by blank lines
      .map(chunk => chunk.trim())
      .filter(chunk => chunk.length > 0);
    
    return chunks.length === 0 ? [text] : chunks;
  };

  const handleContentChange = (content: string) => {
    const chunks = generateChunks(content);
    setPreviewChunks(chunks);
  };

  const onSubmit = (values: DocumentFormValues) => {
    if (previewChunks.length === 0) {
      handleContentChange(values.content);
    }
    
    createDocumentMutation.mutate(values);
  };

  return (
    <PageLayout title="Vector Upload">
      <div className="container mx-auto max-w-5xl">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink as={Link} to="/admin">Admin</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbPage>Vector Upload</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Upload Document</CardTitle>
              <CardDescription>
                Add text or markdown content to your knowledge base
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <div className="grid grid-cols-2 gap-4">
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
                                  <SelectValue placeholder="Collection" />
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
                                  <SelectValue placeholder="Content Type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="faq">FAQ</SelectItem>
                                <SelectItem value="template">Template</SelectItem>
                                <SelectItem value="terminology">Terminology</SelectItem>
                                <SelectItem value="guide">Guide</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter text or markdown content" 
                            className="min-h-[200px] font-mono text-sm" 
                            {...field} 
                            onChange={e => {
                              field.onChange(e);
                              handleContentChange(e.target.value);
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Separate paragraphs with blank lines for better chunking
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {previewChunks.length > 0 && (
                    <div className="border rounded-md p-4">
                      <h3 className="text-sm font-medium mb-2">Content Chunks Preview ({previewChunks.length})</h3>
                      <div className="max-h-[300px] overflow-y-auto space-y-2">
                        {previewChunks.map((chunk, i) => (
                          <div key={i} className="text-sm p-2 bg-muted rounded">
                            <span className="text-xs text-muted-foreground mr-2">#{i+1}</span>
                            {chunk.length > 100 ? `${chunk.substring(0, 100)}...` : chunk}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={createDocumentMutation.isPending}
                    className="w-full"
                  >
                    {createDocumentMutation.isPending ? "Uploading..." : "Upload Document"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Recent Uploads</CardTitle>
              <CardDescription>
                Documents in your knowledge base
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No documents uploaded yet
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Collection</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Added</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {documents.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell className="font-medium">{doc.title}</TableCell>
                          <TableCell>{doc.collection}</TableCell>
                          <TableCell>{doc.content_type}</TableCell>
                          <TableCell>{format(new Date(doc.created_at), "MMM d, yyyy")}</TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => deleteDocumentMutation.mutate(doc.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default VectorUpload;
