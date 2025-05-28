
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Copy, Trash2 } from "lucide-react";
import { EstimatePromptTemplate, PromptPurpose } from "@/utils/estimatePrompts";

interface EstimatePromptTableProps {
  prompts: EstimatePromptTemplate[];
  loading: boolean;
  onEdit: (prompt: EstimatePromptTemplate) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

const purposeLabels: Record<PromptPurpose, string> = {
  scope: "Scope Extractor",
  suggestion: "Suggestion Engine",
  pdf_summary: "PDF Summary"
};

export const EstimatePromptTable = ({ 
  prompts, 
  loading, 
  onEdit, 
  onDelete, 
  onDuplicate 
}: EstimatePromptTableProps) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (prompts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No prompt templates found. Create your first template to get started.
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Purpose</TableHead>
            <TableHead>Model</TableHead>
            <TableHead>Temperature</TableHead>
            <TableHead>Active</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {prompts.map((prompt) => (
            <TableRow key={prompt.id}>
              <TableCell className="font-medium">{prompt.name}</TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {purposeLabels[prompt.purpose]}
                </Badge>
              </TableCell>
              <TableCell>{prompt.model}</TableCell>
              <TableCell>{prompt.temperature}</TableCell>
              <TableCell>
                {prompt.active ? (
                  <Badge variant="default" className="bg-green-600">Active</Badge>
                ) : (
                  <Badge variant="outline">Inactive</Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(prompt)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDuplicate(prompt.id)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(prompt.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
