
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PromptField, parseFieldOptions } from '@/types/prompt-field';
import { useToast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';

export const usePromptFields = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: fields = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['promptFields'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prompt_fields')
        .select('*')
        .order('section')
        .order('order_position');

      if (error) throw error;
      
      // Transform the data to match our PromptField type
      return data.map(field => ({
        ...field,
        options: field.options ? parseFieldOptions(field.options) : undefined
      })) as PromptField[];
    },
  });

  const updateField = useMutation({
    mutationFn: async (field: Partial<PromptField> & { id: string }) => {
      // Convert FieldOption[] to Json format for Supabase
      const fieldToUpdate = {
        ...field,
        // If options exists and is an array, convert it to the format Supabase expects
        options: field.options && Array.isArray(field.options) 
          ? { options: field.options } as Json 
          : field.options
      };
      
      const { data, error } = await supabase
        .from('prompt_fields')
        .update(fieldToUpdate)
        .eq('id', field.id)
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

  const toggleFieldActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { data, error } = await supabase
        .from('prompt_fields')
        .update({ active })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promptFields'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to toggle field: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    fields,
    isLoading,
    error,
    updateField,
    toggleFieldActive,
  };
};
