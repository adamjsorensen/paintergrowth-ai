
import { useState } from "react";
import { useVectorUpload } from "@/hooks/admin/useVectorUpload";
import { useFileUpload } from "@/hooks/admin/useFileUpload";
import { useChunkMetadata } from "@/hooks/admin/useChunkMetadata";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import FileUploadZone from "@/components/admin/vector-upload/FileUploadZone";
import StepIndicator from "@/components/admin/vector-upload/StepIndicator";
import ChunkPreview from "@/components/admin/vector-upload/ChunkPreview";
import { Loader2, ArrowRight } from "lucide-react";

const ACCEPTED_FILE_TYPES = [
  ".txt", ".doc", ".docx", ".csv", ".xlsx", ".md", ".json", ".css"
];

const UPLOAD_STEPS = [
  { id: 1, name: "Upload Content" },
  { id: 2, name: "Review Chunks" },
  { id: 3, name: "Submit" },
];

const VectorUploadForm = () => {
  // State
  const [currentStep, setCurrentStep] = useState(1);
  const [manualContent, setManualContent] = useState("");

  // Hooks
  const { form, uploadDocument, handleContentChange, onSubmit } = useVectorUpload();
  const { 
    file, 
    parsedContent, 
    isParsingFile, 
    parseError, 
    handleFileSelect, 
    resetFileUpload 
  } = useFileUpload();
  const { 
    chunks, 
    isProcessing, 
    processChunks, 
    updateChunkMetadata, 
    removeChunk, 
    clearChunks 
  } = useChunkMetadata();

  // Event handlers
  const handleNextStep = async () => {
    if (currentStep === 1) {
      const content = parsedContent || manualContent;
      if (!content.trim()) {
        return; // Prevent going to next step if no content
      }
      
      // Update form content and process chunks
      form.setValue("content", content);
      const rawChunks = handleContentChange(content);
      await processChunks(rawChunks);
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmitForm = (values) => {
    // Modify the onSubmit function to handle chunks with metadata
    const enhancedValues = {
      ...values,
      chunks: chunks.map(chunk => ({
        content: chunk.content,
        chunk_metadata: chunk.metadata
      }))
    };
    
    onSubmit(enhancedValues);
    
    // Reset form and state
    resetForm();
  };

  const resetForm = () => {
    setCurrentStep(1);
    resetFileUpload();
    clearChunks();
    setManualContent("");
    form.reset();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Upload File</h3>
              <FileUploadZone 
                onFileSelect={handleFileSelect} 
                isLoading={isParsingFile}
                acceptedFileTypes={ACCEPTED_FILE_TYPES}
              />
              {parseError && (
                <p className="mt-2 text-sm text-destructive">{parseError}</p>
              )}
              {file && !parseError && (
                <p className="mt-2 text-sm text-muted-foreground">
                  File: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Content Preview</h3>
              <div className="space-y-2">
                <Textarea
                  value={parsedContent || manualContent}
                  onChange={(e) => setManualContent(e.target.value)}
                  className="min-h-[300px] font-mono text-sm"
                  placeholder="Paste content here or upload a file"
                  disabled={isParsingFile}
                />
                <FormDescription>
                  You can edit this content or paste new text manually.
                </FormDescription>
              </div>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Content Chunks ({chunks.length})</h3>
              {isProcessing && (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Processing chunks...</span>
                </div>
              )}
            </div>
            
            <div className="max-h-[600px] overflow-y-auto pr-2">
              {chunks.map((chunk, index) => (
                <ChunkPreview
                  key={chunk.id}
                  chunk={chunk}
                  index={index}
                  total={chunks.length}
                  onDelete={removeChunk}
                  onMetadataChange={updateChunkMetadata}
                />
              ))}
            </div>
            
            {chunks.length === 0 && !isProcessing && (
              <div className="text-center p-8 border border-dashed rounded-md">
                <p className="text-muted-foreground">No chunks to display. Go back to add content.</p>
              </div>
            )}
          </div>
        );
      
      case 3:
        return (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmitForm)} className="space-y-6">
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

              <div>
                <h3 className="text-lg font-medium mb-2">Summary</h3>
                <div className="border rounded-md p-4 space-y-2">
                  <p><strong>Title:</strong> {form.getValues("title") || "(Not set)"}</p>
                  <p><strong>Collection:</strong> {form.getValues("collection")}</p>
                  <p><strong>Content Type:</strong> {form.getValues("content_type")}</p>
                  <p><strong>Chunks:</strong> {chunks.length}</p>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={uploadDocument.isPending || chunks.length === 0}
              >
                {uploadDocument.isPending ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Uploading...
                  </>
                ) : (
                  "Upload & Vectorize"
                )}
              </Button>
            </form>
          </Form>
        );
      
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Content</CardTitle>
        <CardDescription>
          Add content to the vector database for AI retrieval
        </CardDescription>
        <div className="mt-4">
          <StepIndicator currentStep={currentStep} steps={UPLOAD_STEPS} />
        </div>
      </CardHeader>
      
      <CardContent>
        {renderStepContent()}
      </CardContent>
      
      <CardFooter className="flex justify-between border-t p-6">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevStep}
          disabled={currentStep === 1 || uploadDocument.isPending || isProcessing}
        >
          Back
        </Button>
        
        {currentStep < 3 ? (
          <Button
            type="button"
            onClick={handleNextStep}
            disabled={
              (currentStep === 1 && (!parsedContent && !manualContent)) ||
              isProcessing ||
              (currentStep === 2 && chunks.length === 0)
            }
            className="gap-1"
          >
            Next <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  );
};

export default VectorUploadForm;
