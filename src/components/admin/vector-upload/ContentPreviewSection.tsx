
import { useVectorUpload } from "@/hooks/admin/useVectorUpload";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ContentPreviewSectionProps {
  className?: string;
}

const ContentPreviewSection: React.FC<ContentPreviewSectionProps> = ({ className = "" }) => {
  const { chunks } = useVectorUpload();
  
  return (
    <Card className={className}>
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
  );
};

export default ContentPreviewSection;
