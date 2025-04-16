
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useStylePreferences } from "@/context/StylePreferencesContext";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";
import { validatePlaceholders } from "@/utils/placeholderValidation";

type FieldValue = string | number | boolean | string[];

interface ProposalGenerationProps {
  user: any;
  templateId: string | undefined;
}

export const useProposalGeneration = ({ user, templateId }: ProposalGenerationProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { preferences } = useStylePreferences();
  const { data: companyProfile, isLoading: isLoadingProfile } = useCompanyProfile(user?.id);

  const generateProposal = async (values: Record<string, FieldValue>, proposalId: string) => {
    try {
      setIsGenerating(true);

      // First, ensure the proposal record has the correct pending status
      if (user) {
        await supabase
          .from('saved_proposals')
          .update({ 
            status: "generating" 
          })
          .eq('id', proposalId);
      }

      // Merge company profile with form values
      const mergedValues = {
        ...companyProfile, // Company defaults
        ...values, // Form values take precedence
        _stylePreferences: preferences
      };

      console.log("Generating proposal with merged values:", mergedValues);

      // Start the proposal generation in the background
      const response = await supabase.functions.invoke('generate_proposal', {
        body: {
          promptId: templateId || "00000000-0000-0000-0000-000000000000",
          values: mergedValues,
          proposalId: proposalId
          // Removed hard-coded modelName to use the one from ai_settings table
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
      
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    isLoadingProfile,
    generateProposal
  };
};
