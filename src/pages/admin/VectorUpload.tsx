
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { supabase, Document } from "@/integrations/supabase/client";
import PageLayout from "@/components/PageLayout";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, FileText, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const VectorUploadPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [collection, setCollection] = useState("company_knowledge");
  const [contentType, setContentType] = useState("text");
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const { data, error } = await supabase
          .from("documents")
          .select("*")
          .order("created_at", { ascending: false });
          
        if (error) {
          console.error("Error fetching documents:", error);
        } else if (data) {
          setDocuments(data as Document[]);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocuments();
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Missing fields",
        description: "Please provide both title and content.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setSubmitting(true);
      
      const { error } = await supabase
        .from("documents")
        .insert({
          title,
          content,
          collection,
          content_type: contentType,
        });
        
      if (error) throw error;
      
      toast({
        title: "Document saved",
        description: "Your content has been uploaded successfully.",
      });
      
      // Reset form fields
      setTitle("");
      setContent("");
      
      // Refresh documents list
      const { data: newData } = await supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false });
        
      if (newData) {
        setDocuments(newData as Document[]);
      }
      
    } catch (error) {
      console.error("Error saving document:", error);
      toast({
        title: "Error",
        description: "There was a problem saving your document.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const deleteDocument = async (id: string) => {
    try {
      const { error } = await supabase
        .from("documents")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      setDocuments(documents.filter(doc => doc.id !== id));
      
      toast({
        title: "Document deleted",
        description: "The document has been removed.",
      });
      
    } catch (error) {
      console.error("Error deleting document:", error);
      toast({
        title: "Error",
        description: "There was a problem deleting the document.",
        variant: "destructive",
      });
    }
  };

  return (
    <PageLayout title="Vector Upload">
      <div className="max-w-6xl mx-auto pb-10">
        <Breadcrumb className="mb-6 ml-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink as={Link} to="/dashboard">
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink as={Link} to="/admin">
                Admin
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbPage>Vector Upload</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add Document Form */}
          <Card>
            <CardHeader>
              <CardTitle>Add Document</CardTitle>
              <CardDescription>
                Upload content to use in proposal generation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="collection">Collection</Label>
                  <Select 
                    value={collection} 
                    onValueChange={setCollection}
                  >
                    <SelectTrigger id="collection">
                      <SelectValue placeholder="Select collection" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="company_knowledge">Company Knowledge</SelectItem>
                      <SelectItem value="testimonials">Testimonials</SelectItem>
                      <SelectItem value="proposals">Example Proposals</SelectItem>
                      <SelectItem value="pricing">Pricing Information</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="content-type">Content Type</Label>
                  <Select 
                    value={contentType} 
                    onValueChange={setContentType}
                  >
                    <SelectTrigger id="content-type">
                      <SelectValue placeholder="Select content type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Plain Text</SelectItem>
                      <SelectItem value="markdown">Markdown</SelectItem>
                      <SelectItem value="html">HTML</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input 
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="About Our Products"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea 
                    id="content"
                    rows={8}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter your content here..."
                    required
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    type="submit"
                    disabled={submitting || !title.trim() || !content.trim()}
                  >
                    {submitting ? "Uploading..." : "Upload Document"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          {/* Documents List */}
          <Card>
            <CardHeader>
              <CardTitle>Your Documents</CardTitle>
              <CardDescription>
                Manage uploaded documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : documents.length > 0 ? (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {documents.map((doc) => (
                    <div key={doc.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{doc.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{doc.collection}</Badge>
                            <Badge variant="secondary">{doc.content_type}</Badge>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => deleteDocument(doc.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {doc.content}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-3" />
                  <h3 className="font-medium text-lg mb-1">No Documents Yet</h3>
                  <p className="text-muted-foreground max-w-xs">
                    Start by adding a document to use as knowledge in your proposal generation.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default VectorUploadPage;
