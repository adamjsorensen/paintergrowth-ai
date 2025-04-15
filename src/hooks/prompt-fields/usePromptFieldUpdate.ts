
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PromptField, PromptFieldInput } from './types';

export const usePromptFieldUpdate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...field }: Partial<PromptFieldInput> & { id: string }) => {
      const { data, error } = await supabase
        .from('prompt_fields')
        .update(field)
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
