
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

interface EmptyProposalStateProps {
  onBack: () => void;
}

export const EmptyProposalState = ({ onBack }: EmptyProposalStateProps) => {
  return (
    <Card className="border-none shadow-md">
      <CardContent className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Proposal Not Found</h2>
        <p className="text-gray-600 mb-8">
          We couldn't find this proposal or it's still being generated. 
          You can go back and try again.
        </p>
        <Button onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Proposal Form
        </Button>
      </CardContent>
    </Card>
  );
};
