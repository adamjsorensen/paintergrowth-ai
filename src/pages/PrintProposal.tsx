
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
    return <div>Proposal not found</div>;
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
