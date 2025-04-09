
import { Copy, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GenerationLoading, EmptyProposalState } from "./LoadingStates";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ProposalResultProps {
  proposal: string | null;
  isLoading: boolean;
  onCopy: () => void;
  onSave: () => void;
}

const ProposalResult = ({ proposal, isLoading, onCopy, onSave }: ProposalResultProps) => {
  if (isLoading) {
    return <GenerationLoading />;
  }

  if (!proposal) {
    return <EmptyProposalState />;
  }

  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="mb-4 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onCopy}>
            <Copy className="mr-2 h-4 w-4" />
            Copy
          </Button>
          <Button variant="secondary" size="sm" onClick={onSave}>
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
        </div>
        <div className="prose prose-blue max-w-none overflow-auto">
          <ReactMarkdown
            className="font-sans"
            remarkPlugins={[remarkGfm]}
          >
            {proposal}
          </ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProposalResult;
