
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const EmptyProposals = () => {
  return (
    <Card className="p-12 text-center border-dashed">
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-gray-600">No saved proposals</h3>
        <p className="text-sm text-gray-500">
          Generate and save proposals to see them here
        </p>
        <Button className="mt-4" asChild>
          <a href="/generate">Create Your First Proposal</a>
        </Button>
      </div>
    </Card>
  );
};

export default EmptyProposals;
