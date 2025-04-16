
import { useEffect, useState } from "react";
import { usePromptTemplate } from "@/hooks/usePromptTemplate";
import { useAuth } from "@/components/AuthProvider";
import { usePromptFields } from "@/hooks/prompt-fields/usePromptFields";
import PageLayout from "@/components/PageLayout";
import { TemplateLoading } from "@/components/proposal-generator/LoadingStates";
import ProposalForm from "@/components/proposal-generator/ProposalForm";
import { useProposalGeneration } from "@/components/proposal-generator/hooks/useProposalGeneration";
import { ENHANCED_FIELDS } from "@/components/proposal-generator/constants/templateFields";
import { ENHANCED_SYSTEM_PROMPT } from "@/components/proposal-generator/constants/templatePrompts";
import { FieldConfig } from "@/types/prompt-templates";
import InteriorExteriorToggle from "@/components/proposal-generator/InteriorExteriorToggle";

const ProposalGenerator = () => {
  const [projectType, setProjectType] = useState<'interior' | 'exterior'>('interior');
  
  // Get prompt fields from the database
  const { 
    fields: promptFields, 
    isLoading: isLoadingFields,
    convertToFieldConfig 
  } = usePromptFields();
  
  // Get template information (for system prompt)
  const { 
    promptTemplate, 
    fields: templateFields, 
    isLoading: isLoadingTemplate, 
    isCreating, 
    ensureEnhancedTemplateExists, 
    fetchPromptTemplate 
  } = usePromptTemplate(ENHANCED_FIELDS);
  
  const { user } = useAuth();
  const { isGenerating, generateProposal } = useProposalGeneration({
    user,
    templateId: promptTemplate?.id
  });

  // Convert database fields to FieldConfig format for the form
  const formFields = promptFields
    .filter(field => field.active)
    .length > 0 
      ? convertToFieldConfig(promptFields.filter(field => field.active))
      : templateFields;

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

  const isLoading = isLoadingTemplate || isCreating || isLoadingFields;

  if (isLoading) {
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
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-center mb-3">Proposal Type</h2>
          <InteriorExteriorToggle value={projectType} onChange={setProjectType} />
        </div>
        
        <ProposalForm 
          fields={formFields}
          isGenerating={isGenerating}
          onGenerate={generateProposal}
          templateName={promptTemplate?.name || "Painting Proposal"}
          projectType={projectType}
        />
      </div>
    </PageLayout>
  );
};

export default ProposalGenerator;
