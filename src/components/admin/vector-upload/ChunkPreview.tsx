
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Edit, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export interface ChunkMetadata {
  tags: string[];
  summary: string;
  section_title?: string;
}

export interface ChunkData {
  id: string;
  content: string;
  metadata?: ChunkMetadata;
}

interface ChunkPreviewProps {
  chunk: ChunkData;
  index: number;
  total: number;
  onDelete: (id: string) => void;
  onMetadataChange: (id: string, metadata: ChunkMetadata) => void;
}

const ChunkPreview = ({ 
  chunk, 
  index, 
  total, 
  onDelete,
  onMetadataChange 
}: ChunkPreviewProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [sectionTitle, setSectionTitle] = useState(chunk.metadata?.section_title || "");
  const [summary, setSummary] = useState(chunk.metadata?.summary || "");

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const handleSaveSectionTitle = () => {
    onMetadataChange(chunk.id, {
      ...chunk.metadata!,
      section_title: sectionTitle
    });
  };

  const handleSaveSummary = () => {
    onMetadataChange(chunk.id, {
      ...chunk.metadata!,
      summary
    });
  };

  const handleTagDelete = (tagToRemove: string) => {
    if (!chunk.metadata) return;
    
    const updatedTags = chunk.metadata.tags.filter(tag => tag !== tagToRemove);
    onMetadataChange(chunk.id, {
      ...chunk.metadata,
      tags: updatedTags
    });
  };

  const handleAddTag = () => {
    if (!tagInput.trim() || !chunk.metadata) return;
    
    const updatedTags = [...chunk.metadata.tags, tagInput.trim()];
    onMetadataChange(chunk.id, {
      ...chunk.metadata,
      tags: updatedTags
    });
    setTagInput("");
    setIsEditingTags(false);
  };

  const shortContent = chunk.content.length > 150 
    ? `${chunk.content.substring(0, 150)}...` 
    : chunk.content;

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <Badge variant="outline" className="mb-2">
              Chunk {index + 1}/{total}
            </Badge>
            
            {chunk.metadata?.section_title ? (
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{chunk.metadata.section_title}</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => {
                    setSectionTitle(chunk.metadata?.section_title || "");
                    setIsExpanded(true);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <CardTitle className="text-lg text-muted-foreground">Untitled Section</CardTitle>
            )}
          </div>
          
          <Button 
            variant="ghost" 
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onDelete(chunk.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Tags */}
          <div>
            <div className="text-sm font-medium mb-1">Tags:</div>
            <div className="flex flex-wrap gap-1 mb-2">
              {chunk.metadata?.tags?.map(tag => (
                <Badge key={tag} variant="secondary" className="group">
                  {tag}
                  <X 
                    className="h-3 w-3 ml-1 opacity-60 group-hover:opacity-100 cursor-pointer"
                    onClick={() => handleTagDelete(tag)}
                  />
                </Badge>
              ))}
              
              {isEditingTags ? (
                <div className="flex items-center gap-1">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    className="h-7 text-xs w-24"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddTag();
                      }
                    }}
                  />
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={handleAddTag}
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => setIsEditingTags(true)}
                >
                  + Add Tag
                </Badge>
              )}
            </div>
          </div>

          {/* Summary */}
          <div>
            <div className="text-sm font-medium mb-1">Summary:</div>
            {isExpanded ? (
              <div className="space-y-2">
                <Textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="min-h-[60px] text-sm"
                />
                <div className="flex justify-end">
                  <Button 
                    size="sm" 
                    onClick={handleSaveSummary}
                  >
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {chunk.metadata?.summary || "No summary available"}
              </p>
            )}
          </div>
          
          {/* Content Preview */}
          <div>
            <div className="text-sm font-medium mb-1">Content:</div>
            <p className="text-sm whitespace-pre-wrap">
              {isExpanded ? chunk.content : shortContent}
            </p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={toggleExpand} 
          className="text-xs"
        >
          {isExpanded ? "Show Less" : "Show More"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ChunkPreview;
