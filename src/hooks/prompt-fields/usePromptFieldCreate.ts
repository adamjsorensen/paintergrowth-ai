
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PromptFieldInput } from './types';

export const usePromptFieldCreate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (field: PromptFieldInput) => {
      const { data, error } = await supabase
        .from('prompt_fields')
        .insert(field)
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
