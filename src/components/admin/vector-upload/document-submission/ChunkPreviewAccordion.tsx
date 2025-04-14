
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { EnhancedChunk } from "@/hooks/admin/useChunkMetadata";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChunkPreviewAccordionProps {
  chunks: EnhancedChunk[];
}

export const ChunkPreviewAccordion = ({ chunks }: ChunkPreviewAccordionProps) => {
  if (!chunks.length) return null;

  return (
    <ScrollArea className="h-[400px] rounded-md border">
      <Accordion type="single" collapsible className="w-full">
        {chunks.map((chunk, index) => (
          <AccordionItem key={chunk.id} value={chunk.id}>
            <AccordionTrigger className="px-4">
              <div className="flex items-center gap-2 text-left">
                <span className="text-muted-foreground">#{index + 1}</span>
                <span className="font-medium">
                  {chunk.metadata?.section_title || `Chunk ${index + 1}`}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Summary</h4>
                  <p className="text-sm text-muted-foreground">
                    {chunk.metadata?.summary || "No summary available"}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {chunk.metadata?.tags?.map((tag: string) => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    )) || <span className="text-sm text-muted-foreground">No tags</span>}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Content Preview</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {chunk.content.length > 200 
                      ? `${chunk.content.substring(0, 200)}...` 
                      : chunk.content}
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </ScrollArea>
  );
};
