
import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import { BreadcrumbWithLinks } from "@/components/admin/vector-upload/BreadcrumbNav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { Trash2, Search, ArrowUpDown, Loader2 } from "lucide-react";
import { useDocumentManager } from "@/hooks/admin/useDocumentManager";
import { useSemanticSearch, SearchResult } from "@/hooks/admin/useSemanticSearch";
import { formatDate, truncateText, formatSimilarity } from "@/utils/formatUtils";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";

type SearchFormValues = {
  query: string;
  threshold: number;
  limit: number;
};

const DocumentManager = () => {
  const { documents, isLoading, deleteDocument } = useDocumentManager();
  const { isSearching, searchResults, runSemanticSearch } = useSemanticSearch();
  
  const form = useForm<SearchFormValues>({
    defaultValues: {
      query: "",
      threshold: 0.7,
      limit: 5
    }
  });

  const onSubmit = (values: SearchFormValues) => {
    if (!values.query.trim()) {
      toast({
        title: "Search query required",
        description: "Please enter a search query to continue",
        variant: "destructive",
      });
      return;
    }
    
    runSemanticSearch(values.query, values.threshold, values.limit);
  };

  return (
    <PageLayout title="Manage Documents">
      <div className="container mx-auto">
        <BreadcrumbWithLinks />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column - Document List */}
          <div className="lg:col-span-7">
            <Card>
              <CardHeader>
                <CardTitle>Uploaded Documents</CardTitle>
                <CardDescription>
                  Manage your vector-embedded documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="max-h-[70vh] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Collection</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="w-[80px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {documents && documents.length > 0 ? (
                          documents.map((doc) => (
                            <TableRow key={doc.id}>
                              <TableCell className="font-medium">{doc.title}</TableCell>
                              <TableCell>{doc.collection}</TableCell>
                              <TableCell>{doc.content_type}</TableCell>
                              <TableCell>{formatDate(doc.created_at || '')}</TableCell>
                              <TableCell>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => deleteDocument.mutate(doc.id)}
                                  disabled={deleteDocument.isPending}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8">
                              No documents found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Right column - Search */}
          <div className="lg:col-span-5">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Test Semantic Search</CardTitle>
                <CardDescription>
                  Search documents by semantic similarity using vector embeddings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="query"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Search Query</FormLabel>
                          <FormControl>
                            <Input placeholder="E.g., high quality finish" {...field} />
                          </FormControl>
                          <FormDescription>
                            Enter text to find semantically similar content
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="threshold"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Similarity Threshold: {field.value.toFixed(2)}</FormLabel>
                          <FormControl>
                            <Slider 
                              min={0.5} 
                              max={0.95} 
                              step={0.01}
                              value={[field.value]}
                              onValueChange={(values) => field.onChange(values[0])}
                            />
                          </FormControl>
                          <FormDescription>
                            Higher values require closer matches (0.5-0.95)
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="limit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Result Limit</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min={1} 
                              max={20} 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 5)}
                            />
                          </FormControl>
                          <FormDescription>
                            Maximum number of results to return
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isSearching}
                    >
                      {isSearching ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Searching...
                        </>
                      ) : (
                        <>
                          <Search className="mr-2 h-4 w-4" />
                          Run Search
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Search Results</CardTitle>
              </CardHeader>
              <CardContent>
                {searchResults.length > 0 ? (
                  <div className="max-h-[40vh] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Similarity</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {searchResults.map((result) => (
                          <TableRow key={result.id}>
                            <TableCell className="font-medium">
                              <div>{result.title}</div>
                              <div className="text-muted-foreground text-sm mt-1">
                                {truncateText(result.content)}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              {formatSimilarity(result.similarity)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {isSearching ? 
                      "Searching..." : 
                      "No results to display. Try running a search."}
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

export default DocumentManager;
