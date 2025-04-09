
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PromptTemplate, FieldConfig, parseFieldConfig } from "@/types/prompt-templates";
import PageLayout from "@/components/PageLayout";
import SaveProposalDialog from "@/components/SaveProposalDialog";
import { TemplateLoading, NoTemplateMessage } from "@/components/proposal-generator/LoadingStates";
import ProposalForm from "@/components/proposal-generator/ProposalForm";
import ProposalResult from "@/components/proposal-generator/ProposalResult";

type FieldValue = string | number | boolean;

const ProposalGenerator = () => {
  const [promptTemplate, setPromptTemplate] = useState<PromptTemplate | null>(null);
  const [fields, setFields] = useState<FieldConfig[]>([]);
  const [fieldValues, setFieldValues] = useState<Record<string, FieldValue>>({});
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(true);
  const [isLoadingGeneration, setIsLoadingGeneration] = useState(false);
  const [proposal, setProposal] = useState<string | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const { toast } = useToast();

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

  const handleGenerate = async (values: Record<string, FieldValue>) => {
    if (!promptTemplate) {
      toast({
        title: "Error",
        description: "No prompt template available",
        variant: "destructive",
      });
      return;
    }

    setFieldValues(values);

    // Check if required fields are filled
    const missingRequiredFields = fields
      .filter(field => field.required)
      .filter(field => !values[field.id] && values[field.id] !== false)
      .map(field => field.label);

    if (missingRequiredFields.length > 0) {
      toast({
        title: "Missing required fields",
        description: `Please fill in: ${missingRequiredFields.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoadingGeneration(true);
      setProposal(null);

      const response = await supabase.functions.invoke('generate_proposal', {
        body: {
          prompt_id: promptTemplate.id,
          field_values: values
        }
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to generate proposal");
      }

      setProposal(response.data.content);
    } catch (error) {
      console.error("Generation error:", error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoadingGeneration(false);
    }
  };

  const handleCopy = () => {
    if (proposal) {
      navigator.clipboard.writeText(proposal);
      toast({
        title: "Copied to clipboard",
        description: "The proposal has been copied to your clipboard",
      });
    }
  };

  const handleSave = () => {
    setShowSaveDialog(true);
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
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div>
            <ProposalForm 
              fields={fields}
              isGenerating={isLoadingGeneration}
              onGenerate={handleGenerate}
              templateName={promptTemplate.name}
            />
          </div>

          {/* Output Section */}
          <div>
            <ProposalResult
              proposal={proposal}
              isLoading={isLoadingGeneration}
              onCopy={handleCopy}
              onSave={handleSave}
            />
          </div>
        </div>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && proposal && (
        <SaveProposalDialog
          open={showSaveDialog}
          onOpenChange={setShowSaveDialog}
          proposalContent={proposal}
          clientName={fieldValues['clientName'] as string || ''}
          jobType={fieldValues['jobType'] as string || ''}
        />
      )}
    </PageLayout>
  );
};

export default ProposalGenerator;
