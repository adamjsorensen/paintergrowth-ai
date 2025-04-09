
import { useEffect } from "react";
import { usePromptTemplate } from "@/hooks/usePromptTemplate";
import { useAuth } from "@/components/AuthProvider";
import PageLayout from "@/components/PageLayout";
import { TemplateLoading } from "@/components/proposal-generator/LoadingStates";
import ProposalForm from "@/components/proposal-generator/ProposalForm";
import { useProposalGeneration } from "@/components/proposal-generator/hooks/useProposalGeneration";
import { ENHANCED_FIELDS } from "@/components/proposal-generator/constants/templateFields";
import { ENHANCED_SYSTEM_PROMPT } from "@/components/proposal-generator/constants/templatePrompts";

const ProposalGenerator = () => {
  const { 
    promptTemplate, 
    fields, 
    isLoading, 
    isCreating, 
    ensureEnhancedTemplateExists, 
    fetchPromptTemplate 
  } = usePromptTemplate(ENHANCED_FIELDS);
  
  const { user } = useAuth();
  const { isGenerating, generateProposal } = useProposalGeneration({
    user,
    templateId: promptTemplate?.id
  });

  // Fetch template and ensure enhanced template exists
  useEffect(() => {
    const initializeTemplates = async () => {
      const fetchedTemplate = await fetchPromptTemplate();
      
      // If the active template is not the enhanced one, ensure it exists anyway
      if (!fetchedTemplate || fetchedTemplate.name !== "Enhanced Proposal Generator") {
        await ensureEnhancedTemplateExists(
          "Enhanced Proposal Generator",
          ENHANCED_SYSTEM_PROMPT,
          ENHANCED_FIELDS
        );
      }
    };

    initializeTemplates();
  }, []);

  if (isLoading || isCreating) {
    return (
      <PageLayout title="Generate Proposal">
        <div className="container mx-auto py-8 px-4 max-w-5xl">
          <TemplateLoading />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Generate Proposal">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <ProposalForm 
          fields={fields}
          isGenerating={isGenerating}
          onGenerate={generateProposal}
          templateName={promptTemplate?.name || "Painting Proposal"}
        />
      </div>
    </PageLayout>
  );
};

export default ProposalGenerator;
