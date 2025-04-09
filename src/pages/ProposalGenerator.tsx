
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PromptTemplate, FieldConfig, parseFieldConfig } from "@/types/prompt-templates";
import PageLayout from "@/components/PageLayout";
import { TemplateLoading, NoTemplateMessage } from "@/components/proposal-generator/LoadingStates";
import ProposalForm from "@/components/proposal-generator/ProposalForm";
import { useAuth } from "@/components/AuthProvider";
import { useStylePreferences } from "@/context/StylePreferencesContext";

type FieldValue = string | number | boolean | string[];

// Mock field configuration for demo
const MOCK_FIELDS: FieldConfig[] = [
  {
    id: 'clientName',
    label: 'Client Name',
    type: 'text',
    required: true,
    order: 10,
    placeholder: 'Enter client name'
  },
  {
    id: 'jobType',
    label: 'Job Type',
    type: 'select',
    required: true,
    order: 20,
    options: [
      { value: 'interior', label: 'Interior' },
      { value: 'exterior', label: 'Exterior' },
      { value: 'cabinets', label: 'Cabinets' },
      { value: 'deck', label: 'Deck/Fence' },
      { value: 'commercial', label: 'Commercial' }
    ]
  },
  {
    id: 'squareFootage',
    label: 'Square Footage',
    type: 'number',
    required: false,
    order: 30,
    placeholder: 'Approx. square footage'
  },
  {
    id: 'projectAddress',
    label: 'Project Address',
    type: 'textarea',
    required: true,
    order: 15,
    placeholder: 'Enter the full project address'
  },
  {
    id: 'surfacesToPaint',
    label: 'Surfaces to Paint',
    type: 'multi-select',
    required: true,
    order: 40,
    options: [
      { value: 'walls', label: 'Walls' },
      { value: 'ceilings', label: 'Ceilings' },
      { value: 'trim', label: 'Trim' },
      { value: 'doors', label: 'Doors' },
      { value: 'cabinets', label: 'Cabinets' }
    ]
  },
  {
    id: 'prepNeeds',
    label: 'Preparation Needs',
    type: 'checkbox-group',
    required: false,
    order: 50,
    options: [
      { value: 'scraping', label: 'Scraping' },
      { value: 'sanding', label: 'Sanding' },
      { value: 'powerwashing', label: 'Powerwashing' },
      { value: 'caulking', label: 'Caulking' },
      { value: 'patching', label: 'Patching' },
      { value: 'priming', label: 'Priming' }
    ]
  },
  {
    id: 'colorPalette',
    label: 'Preferred Colors / Palette',
    type: 'textarea',
    required: false,
    order: 60,
    placeholder: 'Describe your color preferences'
  },
  {
    id: 'timeline',
    label: 'Timeline or Start Date',
    type: 'date',
    required: false,
    order: 70
  },
  {
    id: 'specialNotes',
    label: 'Special Notes',
    type: 'textarea',
    required: false,
    order: 80,
    placeholder: 'Any additional details or requirements'
  },
  {
    id: 'showDetailedScope',
    label: 'Show detailed scope of work',
    type: 'toggle',
    required: false,
    order: 90
  },
  {
    id: 'breakoutQuote',
    label: 'Break out quote summary',
    type: 'toggle',
    required: false,
    order: 100
  },
  {
    id: 'includeTerms',
    label: 'Include terms & conditions',
    type: 'toggle',
    required: false,
    order: 110
  },
  {
    id: 'uploadFiles',
    label: 'Upload Files/Images',
    type: 'file-upload',
    required: false,
    order: 120,
    helpText: 'Upload reference images or documents'
  }
];

const ProposalGenerator = () => {
  const [promptTemplate, setPromptTemplate] = useState<PromptTemplate | null>(null);
  const [fields, setFields] = useState<FieldConfig[]>(MOCK_FIELDS);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const [isLoadingGeneration, setIsLoadingGeneration] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { preferences } = useStylePreferences();

  // Temporarily skipping API fetch for development
  useEffect(() => {
    setIsLoadingTemplate(false);
    // For development, we'll use the mock fields and skip the API fetch
  }, []);

  const handleGenerate = async (values: Record<string, FieldValue>, proposalId: string) => {
    try {
      setIsLoadingGeneration(true);

      // First, ensure the proposal record has the correct pending status
      if (user) {
        await supabase
          .from('saved_proposals')
          .update({ 
            status: "generating" 
          })
          .eq('id', proposalId);
      }

      // Add style preferences to the values
      const valuesWithPreferences = {
        ...values,
        _stylePreferences: preferences
      };

      console.log("Generating proposal with values:", valuesWithPreferences);

      // Start the proposal generation in the background
      const response = await supabase.functions.invoke('generate_proposal', {
        body: {
          // If no template is available, use a default template ID
          prompt_id: promptTemplate?.id || "00000000-0000-0000-0000-000000000000",
          field_values: valuesWithPreferences,
          proposal_id: proposalId
        }
      });

      if (response.error) {
        if (user) {
          await supabase
            .from('saved_proposals')
            .update({ 
              status: "failed" 
            })
            .eq('id', proposalId);
        }
        
        throw new Error(response.error.message || "Failed to generate proposal");
      }

      console.log("Generation started successfully for proposal:", proposalId);
    } catch (error) {
      console.error("Generation error:", error);
      
      if (user) {
        await supabase
          .from('saved_proposals')
          .update({ 
            status: "failed" 
          })
          .eq('id', proposalId);
      }
      
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoadingGeneration(false);
    }
  };

  if (isLoadingTemplate) {
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
          isGenerating={isLoadingGeneration}
          onGenerate={handleGenerate}
          templateName="Painting Proposal"
        />
      </div>
    </PageLayout>
  );
};

export default ProposalGenerator;
