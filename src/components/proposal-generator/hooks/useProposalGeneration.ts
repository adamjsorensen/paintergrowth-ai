
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useStylePreferences } from "@/context/StylePreferencesContext";

type FieldValue = string | number | boolean | string[];

interface ProposalGenerationProps {
  user: any;
  templateId: string | undefined;
}

export const useProposalGeneration = ({ user, templateId }: ProposalGenerationProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { preferences } = useStylePreferences();

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

      // Add style preferences to the values
      const valuesWithPreferences = {
        ...values,
        _stylePreferences: preferences
      };

      console.log("Generating proposal with values:", valuesWithPreferences);

      // Start the proposal generation in the background
      const response = await supabase.functions.invoke('generate_proposal', {
        body: {
          // Use the actual template ID if available, otherwise use a default ID
          promptId: templateId || "00000000-0000-0000-0000-000000000000",
          values: valuesWithPreferences,
          proposalId: proposalId,
          modelName: 'openai/gpt-4o-mini'
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
    generateProposal
  };
};
