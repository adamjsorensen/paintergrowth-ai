
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PromptField, PromptFieldInput, FieldOption, formatFieldOptions } from './types';

export const usePromptFieldUpdate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...fieldData }: Partial<PromptFieldInput> & { id: string }) => {
      // Ensure we're sending data in the format the database expects
      const { data, error } = await supabase
        .from('prompt_fields')
        .update(fieldData)
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
