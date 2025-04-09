
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface ProposalHeaderProps {
  onBack: () => void;
}

export const ProposalHeader = ({ onBack }: ProposalHeaderProps) => {
  return (
    <Button 
      variant="outline" 
      className="mb-4"
      onClick={onBack}
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      Back to Form
    </Button>
  );
};
