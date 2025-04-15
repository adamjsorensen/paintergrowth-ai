
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PromptFieldInput, formatFieldOptions, FieldOption } from './types';

export const usePromptFieldCreate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (field: PromptFieldInput) => {
      // Prepare field data for database insertion
      const fieldData = {
        name: field.name,
        label: field.label,
        type: field.type,
        section: field.section,
        order_position: field.order_position,
        required: field.required || false,
        complexity: field.complexity || 'basic',
        help_text: field.help_text || "",
        placeholder: field.placeholder || "",
        options: field.options, // Already in the correct format
        active: field.active ?? true,
        prompt_snippet: field.prompt_snippet
      };

      const { data, error } = await supabase
        .from('prompt_fields')
        .insert(fieldData)
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
