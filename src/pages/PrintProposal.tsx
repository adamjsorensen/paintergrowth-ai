
import { useParams } from "react-router-dom";
import { useProposalFetch } from "@/hooks/useProposalFetch";
import { useAuth } from "@/components/AuthProvider";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";
import { useUserProfile } from "@/hooks/useUserProfile";
import PrintableProposal from "@/components/proposal-viewer/PrintableProposal";
import LoadingAnimation from "@/components/proposal-generator/LoadingAnimation";
import { getOrCreateProposalSnapshot } from "@/utils/snapshotUtils";
import { useEffect, useState } from "react";

const PrintProposal = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { proposal, loading, metadata } = useProposalFetch(id, user?.id);
  const { data: companyProfile, isLoading: isLoadingProfile } = useCompanyProfile(user?.id);
  const { data: userProfile, isLoading: isLoadingUserProfile } = useUserProfile(user?.id);
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false);

  // Combine user profile data with metadata
  const enhancedMetadata = {
    ...metadata,
    preparedBy: userProfile?.full_name || metadata.preparedBy,
    preparedByTitle: userProfile?.job_title || metadata.preparedByTitle,
  };

  // Create snapshot when proposal is loaded
  useEffect(() => {
    if (id && proposal && !loading && !isLoadingProfile) {
      setIsCreatingSnapshot(true);
      
      const createSnapshot = async () => {
        await getOrCreateProposalSnapshot(
          id, 
          proposal, 
          enhancedMetadata, 
          companyProfile
        );
        setIsCreatingSnapshot(false);
      };
      
      createSnapshot();
    }
  }, [id, proposal, loading, isLoadingProfile, companyProfile, enhancedMetadata]);

  if (loading || isLoadingProfile || isLoadingUserProfile || isCreatingSnapshot) {
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
