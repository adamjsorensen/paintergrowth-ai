
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const usePromptFieldDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('prompt_fields')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Return a resolved promise to satisfy the MutationFunction type
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promptFields'] });
    }
  });
};
