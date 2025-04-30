
import { useParams } from "react-router-dom";
import { useProposalFetch } from "@/hooks/useProposalFetch";
import { useAuth } from "@/components/AuthProvider";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";
import { useUserProfile } from "@/hooks/useUserProfile";
import PrintableProposal from "@/components/proposal-viewer/PrintableProposal";
import LoadingAnimation from "@/components/proposal-generator/LoadingAnimation";

const PrintProposal = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { proposal, loading, metadata } = useProposalFetch(id, user?.id);
  const { data: companyProfile, isLoading: isLoadingProfile } = useCompanyProfile(user?.id);
  const { data: userProfile, isLoading: isLoadingUserProfile } = useUserProfile(user?.id);

  // Combine user profile data with metadata
  const enhancedMetadata = {
    ...metadata,
    preparedBy: userProfile?.full_name || metadata.preparedBy,
    preparedByTitle: userProfile?.job_title || metadata.preparedByTitle,
  };

  if (loading || isLoadingProfile || isLoadingUserProfile) {
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
      metadata={enhancedMetadata}
      companyProfile={companyProfile}
    />
  );
};

export default PrintProposal;
