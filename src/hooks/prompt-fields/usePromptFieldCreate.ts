
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PromptFieldInput } from './types';

export const usePromptFieldCreate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fieldData: PromptFieldInput) => {
      const { data, error } = await supabase
        .from('prompt_fields')
        .insert({
          name: fieldData.name,
          label: fieldData.label,
          type: fieldData.type as any, // Use type assertion to work around the enum mismatch
          section: fieldData.section,
          required: fieldData.required || false,
          complexity: fieldData.complexity || 'basic',
          help_text: fieldData.help_text || '',
          placeholder: fieldData.placeholder || '',
          options: fieldData.options || null,
          order_position: fieldData.order_position || 0,
          active: fieldData.active !== undefined ? fieldData.active : true,
          prompt_snippet: fieldData.prompt_snippet || '',
          modal_step: fieldData.modal_step || 'main'
        })
        .select('*')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promptFields'] });
    }
  });
};
