
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Save } from "lucide-react";
import { formatProposalText } from "@/utils/formatProposalText";

interface ProposalContentProps {
  proposal: string;
  onCopy: () => void;
  onSave: () => void;
}

const ProposalContent: React.FC<ProposalContentProps> = ({
  proposal,
  onCopy,
  onSave,
}) => {
  return (
    <Card className="border-none shadow-md">
      <CardHeader className="bg-gray-50 border-b border-gray-100 rounded-t-lg p-6">
        <CardTitle className="text-2xl">Generated Proposal</CardTitle>
      </CardHeader>
      <CardContent className="p-8">
        <div className="prose prose-blue max-w-none">
          {formatProposalText(proposal)}
        </div>
      </CardContent>
      <CardFooter className="py-4 px-8 bg-gray-50 border-t border-gray-100 rounded-b-lg flex justify-end gap-3">
        <Button variant="outline" onClick={onCopy}>
          <Copy className="mr-2 h-4 w-4" />
          Copy
        </Button>
        <Button variant="secondary" onClick={onSave}>
          <Save className="mr-2 h-4 w-4" />
          Save
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProposalContent;
