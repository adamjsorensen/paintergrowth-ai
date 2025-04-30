
import { useParams } from "react-router-dom";
import PublicProposal from "@/components/proposal-viewer/PublicProposal";

const PublicProposalPage = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-8 rounded-lg border border-gray-200 shadow-sm text-center">
          <h2 className="text-xl font-medium mb-2">Invalid Request</h2>
          <p className="text-gray-600">No proposal ID provided.</p>
        </div>
      </div>
    );
  }

  return <PublicProposal id={id} />;
};

export default PublicProposalPage;
