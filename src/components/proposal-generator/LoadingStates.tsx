
import { RefreshCcw } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

interface TemplateLoadingProps {
  className?: string;
}

export const TemplateLoading = ({ className }: TemplateLoadingProps) => {
  return (
    <div className={`flex justify-center items-center h-64 ${className}`}>
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>
  );
};

export const GenerationLoading = () => {
  return (
    <Card className="h-full">
      <CardContent className="p-6 flex flex-col justify-center items-center h-full">
        <div className="space-y-4 text-center">
          <RefreshCcw className="h-12 w-12 animate-spin text-primary mx-auto" />
          <h3 className="font-medium">Generating your proposal...</h3>
          <Progress value={65} className="w-full" />
          <p className="text-sm text-muted-foreground">
            This may take a few moments
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export const NoTemplateMessage = () => {
  return (
    <div className="text-center p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">No Active Template</h2>
      <p className="text-gray-600">
        There is no active proposal template. Please set up a template in the admin section.
      </p>
    </div>
  );
};

export const EmptyProposalState = () => {
  return (
    <div className="flex h-full items-center justify-center border border-dashed border-gray-300 rounded-lg p-12 text-center">
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-gray-600">No Proposal Generated Yet</h3>
        <p className="text-sm text-gray-500">
          Fill out the form and click "Generate Proposal" to create your customized proposal
        </p>
      </div>
    </div>
  );
};
