
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PromptField, PromptFieldInput } from './types';
import { isMatrixConfig, validateMatrixConfig } from '@/types/prompt-templates';
import { SectionType } from '@/types/prompt-field';

export const usePromptFieldUpdate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...fieldData }: Partial<PromptFieldInput> & { id: string }) => {
      // Check if this is a matrix field and validate it
      let fieldOptions = fieldData.options;
      if (fieldData.type === 'matrix-selector' && fieldOptions) {
        if (!validateMatrixConfig(fieldOptions)) {
          toast({
            title: "Invalid matrix configuration",
            description: "Matrix fields must have at least one row and one column",
            variant: "destructive",
          });
          throw new Error("Invalid matrix configuration");
        }
        
        // Ensure the discriminator is set
        if (isMatrixConfig(fieldOptions) && !fieldOptions.type) {
          fieldOptions = { ...fieldOptions, type: 'matrix-config' };
        }
      }

      // Update field data with validated options
      const updatedFieldData = {
        ...fieldData,
        options: fieldOptions
      };

      // Ensure we're sending data in the format the database expects
      const { data, error } = await supabase
        .from('prompt_fields')
        .update(updatedFieldData as any) // TypeScript type assertion to bypass type checking
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promptFields'] });
      toast({
        title: "Success",
        description: "Field updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update field: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};
