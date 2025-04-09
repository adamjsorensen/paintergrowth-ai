
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PromptTemplate, FieldConfig, parseFieldConfig } from "@/types/prompt-templates";
import PageLayout from "@/components/PageLayout";
import { TemplateLoading, NoTemplateMessage } from "@/components/proposal-generator/LoadingStates";
import ProposalForm from "@/components/proposal-generator/ProposalForm";
import { useAuth } from "@/components/AuthProvider";
import { useStylePreferences } from "@/context/StylePreferencesContext";

type FieldValue = string | number | boolean;

const ProposalGenerator = () => {
  const [promptTemplate, setPromptTemplate] = useState<PromptTemplate | null>(null);
  const [fields, setFields] = useState<FieldConfig[]>([]);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(true);
  const [isLoadingGeneration, setIsLoadingGeneration] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { preferences } = useStylePreferences();

  // Fetch the active prompt template on component mount
  useEffect(() => {
    const fetchActivePromptTemplate = async () => {
      try {
        const { data, error } = await supabase
          .from("prompt_templates")
          .select("*")
          .eq("active", true)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          const parsedTemplate = {
            ...data,
            field_config: parseFieldConfig(data.field_config)
          } as PromptTemplate;
          
          setPromptTemplate(parsedTemplate);
          setFields(parseFieldConfig(data.field_config));
        }
      } catch (error) {
        console.error("Error fetching prompt template:", error);
        toast({
          title: "Error",
          description: "Could not load proposal template",
          variant: "destructive",
        });
      } finally {
        setIsLoadingTemplate(false);
      }
    };

    fetchActivePromptTemplate();
  }, [toast]);

  const handleGenerate = async (values: Record<string, FieldValue>, proposalId: string) => {
    if (!promptTemplate) {
      toast({
        title: "Error",
        description: "No prompt template available",
        variant: "destructive",
      });
      return;
    }

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

      // Start the proposal generation in the background
      const response = await supabase.functions.invoke('generate_proposal', {
        body: {
          prompt_id: promptTemplate.id,
          field_values: valuesWithPreferences,
          proposal_id: proposalId
        }
      });

      if (response.error) {
        // Update status to failed if the function invocation fails
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

      // We don't need to handle the response content here anymore
      // as we'll be polling for it in the ViewProposal page
      console.log("Generation started successfully for proposal:", proposalId);
    } catch (error) {
      console.error("Generation error:", error);
      
      // Update the proposal record to indicate failure
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

  if (!promptTemplate) {
    return (
      <PageLayout title="Generate Proposal">
        <div className="container mx-auto py-8 px-4 max-w-5xl">
          <NoTemplateMessage />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Generate Proposal">
      <div className="container mx-auto py-8 px-4 max-w-3xl">
        <ProposalForm 
          fields={fields}
          isGenerating={isLoadingGeneration}
          onGenerate={handleGenerate}
          templateName={promptTemplate.name}
        />
      </div>
    </PageLayout>
  );
};

export default ProposalGenerator;
