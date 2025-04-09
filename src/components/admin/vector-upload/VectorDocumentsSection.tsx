
import { useVectorDocuments } from "@/hooks/admin/useVectorDocuments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import EmbeddingStatusIndicator from "./EmbeddingStatus";

const VectorDocumentsSection = () => {
  const { documents, isLoading, embeddingStatus, generateEmbedding } = useVectorDocuments();

  return (
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
                  <TableHead>Embedding</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents && documents.length > 0 ? (
                  documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.title}</TableCell>
                      <TableCell>{doc.content_type}</TableCell>
                      <TableCell>
                        <EmbeddingStatusIndicator 
                          doc={doc} 
                          status={embeddingStatus}
                          onGenerateEmbedding={(id) => generateEmbedding.mutate(id)}
                          isGenerating={generateEmbedding.isPending}
                        />
                      </TableCell>
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
  );
};

export default VectorDocumentsSection;
