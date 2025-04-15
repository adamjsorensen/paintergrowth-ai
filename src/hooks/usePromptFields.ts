
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PromptField, parseFieldOptions } from '@/types/prompt-field';
import { useToast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';
import { FieldConfig } from '@/types/prompt-templates';

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

  const createField = useMutation({
    mutationFn: async (field: Omit<PromptField, 'id' | 'created_at' | 'updated_at'>) => {
      // Convert options to JSON format for Supabase if present
      const fieldToCreate: Record<string, any> = { ...field };
      
      if (field.options && Array.isArray(field.options)) {
        fieldToCreate.options = { options: field.options } as unknown as Json;
      }
      
      const { data, error } = await supabase
        .from('prompt_fields')
        .insert(fieldToCreate)
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

  const updateField = useMutation({
    mutationFn: async (field: Partial<PromptField> & { id: string }) => {
      // We need to convert FieldOption[] to the format Supabase expects
      const fieldToUpdate: Record<string, any> = { ...field };
      
      // Handle options conversion to JSON format for Supabase
      if (field.options && Array.isArray(field.options)) {
        fieldToUpdate.options = { options: field.options } as unknown as Json;
      }
      
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

  const deleteField = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('prompt_fields')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promptFields'] });
      toast({
        title: "Success",
        description: "Field deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete field: ${error.message}`,
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

  // Convert PromptField array to FieldConfig array for backward compatibility
  const convertToFieldConfig = (promptFields: PromptField[]): FieldConfig[] => {
    return promptFields.map(field => ({
      id: field.id,
      name: field.name,
      label: field.label,
      type: field.type,
      required: field.required || false,
      complexity: field.complexity || 'basic',
      order: field.order_position,
      helpText: field.help_text,
      placeholder: field.placeholder,
      options: field.options || [],
      sectionId: field.section
    }));
  };

  return {
    fields,
    isLoading,
    error,
    createField,
    updateField,
    deleteField,
    toggleFieldActive,
    convertToFieldConfig
  };
};
