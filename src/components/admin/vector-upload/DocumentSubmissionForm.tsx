
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";
import { DocumentMetadataForm } from "./document-submission/DocumentMetadataForm";
import { ChunkPreviewAccordion } from "./document-submission/ChunkPreviewAccordion";
import { FullDocumentPreview } from "./document-submission/FullDocumentPreview";
import { EnhancedChunk } from "@/hooks/admin/useChunkMetadata";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "@/hooks/admin/useVectorUpload";

interface DocumentSubmissionFormProps {
  form: UseFormReturn<FormValues>;
  chunks: EnhancedChunk[];
  isSubmitting: boolean;
  onSubmit: (values: FormValues) => void;
}

const DocumentSubmissionForm = ({
  form,
  chunks,
  isSubmitting,
  onSubmit
}: DocumentSubmissionFormProps) => {
  const { toast } = useToast();

  const handleSubmit = async (values: FormValues) => {
    if (!values.title || !values.summary) {
      toast({
        title: "Missing required fields",
        description: "Please fill in both title and summary",
        variant: "destructive",
      });
      return;
    }

    await onSubmit(values);
  };

  const hasRequiredFields = form.watch("title") && form.watch("summary");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Document Information</CardTitle>
            <CardDescription>
              Review and finalize document details before generating embeddings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DocumentMetadataForm form={form} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content Review</CardTitle>
            <CardDescription>
              Review generated chunks and their metadata
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ChunkPreviewAccordion chunks={chunks} />
            <FullDocumentPreview chunks={chunks} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !chunks.length || !hasRequiredFields}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Embeddings...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Generate Embeddings & Save
                </>
              )}
            </Button>
          </CardContent>
          <CardFooter className="text-sm text-muted-foreground">
            {chunks.length} chunks will be processed
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};

export default DocumentSubmissionForm;
