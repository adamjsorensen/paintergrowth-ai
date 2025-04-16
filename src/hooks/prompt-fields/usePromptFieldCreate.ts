
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PromptFieldInput } from './types';
import { isMatrixConfig, validateMatrixConfig } from '@/types/prompt-templates';
import { SectionType } from '@/types/prompt-field';

export const usePromptFieldCreate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (field: PromptFieldInput) => {
      // Check if this is a matrix field and validate it
      let fieldOptions = field.options;
      if (field.type === 'matrix-selector' && fieldOptions) {
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

      // Prepare field data for database insertion
      const fieldData = {
        name: field.name,
        label: field.label,
        type: field.type,
        section: field.section,
        order_position: field.order_position || 0,
        required: field.required || false,
        complexity: field.complexity || 'basic',
        help_text: field.help_text || "",
        placeholder: field.placeholder || "",
        options: fieldOptions,
        active: field.active ?? true,
        prompt_snippet: field.prompt_snippet || ""
      };

      // Use type assertion to handle the database enum type
      const { data, error } = await supabase
        .from('prompt_fields')
        .insert(fieldData as any) // TypeScript type assertion to bypass type checking
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promptFields'] });
      toast({
        title: "Success",
        description: "Field created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create field: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};
