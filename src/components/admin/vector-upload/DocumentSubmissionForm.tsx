
import { UseFormReturn } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { EnhancedChunk } from "@/hooks/admin/useChunkMetadata";

interface DocumentSubmissionFormProps {
  form: UseFormReturn<any>;
  chunks: EnhancedChunk[];
  isSubmitting: boolean;
  onSubmit: (values: any) => void;
}

const DocumentSubmissionForm = ({
  form,
  chunks,
  isSubmitting,
  onSubmit
}: DocumentSubmissionFormProps) => {
  return (
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
          disabled={isSubmitting || chunks.length === 0}
        >
          {isSubmitting ? (
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
};

export default DocumentSubmissionForm;
