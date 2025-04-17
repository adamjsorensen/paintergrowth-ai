
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
import { useStylePreferences } from "@/context/StylePreferencesContext";
import CoverImageUpload from "@/components/proposal-generator/CoverImageUpload";
import { supabase } from "@/integrations/supabase/client";

const ProposalGenerator = () => {
  const { preferences } = useStylePreferences();
  const projectType = preferences.jobType || 'interior';
  
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  
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

  // Save cover image URL to database
  useEffect(() => {
    const saveCoverImageUrl = async () => {
      if (coverImageUrl && user) {
        const { error } = await supabase
          .from('proposal_pdf_settings')
          .upsert({ 
            id: user.id, 
            cover_image_url: coverImageUrl 
          });
        
        if (error) {
          console.error('Error saving cover image URL:', error);
        }
      }
    };

    saveCoverImageUrl();
  }, [coverImageUrl, user]);

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
        {user && (
          <div className="mb-6">
            <CoverImageUpload 
              userId={user.id} 
              onImageUpload={setCoverImageUrl} 
            />
          </div>
        )}
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
