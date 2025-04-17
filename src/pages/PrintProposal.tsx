
import { useParams } from "react-router-dom";
import { useProposalFetch } from "@/hooks/useProposalFetch";
import { useAuth } from "@/components/AuthProvider";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";
import PrintableProposal from "@/components/proposal-viewer/PrintableProposal";
import LoadingAnimation from "@/components/proposal-generator/LoadingAnimation";

const PrintProposal = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { proposal, loading, metadata } = useProposalFetch(id, user?.id);
  const { data: companyProfile, isLoading: isLoadingProfile } = useCompanyProfile(user?.id);

  if (loading || isLoadingProfile) {
    return <LoadingAnimation />;
  }

  if (!proposal) {
    return <div className="flex items-center justify-center min-h-[50vh]">
      <div className="p-8 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-xl font-medium mb-2">Proposal Not Found</h2>
        <p>The proposal you're looking for doesn't exist or you don't have permission to view it.</p>
      </div>
    </div>;
  }

  return (
    <PrintableProposal
      proposal={proposal}
      metadata={metadata}
      companyProfile={companyProfile}
    />
  );
};

export default PrintProposal;
