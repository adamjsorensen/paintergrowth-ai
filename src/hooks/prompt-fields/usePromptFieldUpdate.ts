
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PromptFieldInput } from './types';

interface UpdateInput extends Partial<PromptFieldInput> {
  id: string;
}

export const usePromptFieldUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fieldData: UpdateInput) => {
      const updateData = {
        name: fieldData.name,
        label: fieldData.label,
        type: fieldData.type,
        section: fieldData.section,
        required: fieldData.required,
        complexity: fieldData.complexity,
        help_text: fieldData.help_text,
        placeholder: fieldData.placeholder,
        options: fieldData.options,
        order_position: fieldData.order_position,
        active: fieldData.active,
        prompt_snippet: fieldData.prompt_snippet,
        modal_step: fieldData.modal_step
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      const { data, error } = await supabase
        .from('prompt_fields')
        .update(updateData)
        .eq('id', fieldData.id)
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
