
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PromptField, parseFieldOptions } from '@/types/prompt-field';
import { useToast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';
import { FieldConfig } from '@/types/prompt-templates';

// Define a type that matches what Supabase expects for insert/update operations
type PromptFieldInput = {
  name: string;
  label: string;
  type: PromptField['type'];
  section: PromptField['section'];
  order_position: number;
  required?: boolean;
  complexity?: 'basic' | 'advanced';
  help_text?: string;
  placeholder?: string;
  active?: boolean;
  options?: Json;
  prompt_snippet?: string;
};

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
      // Prepare the field input to match what Supabase expects
      const fieldToCreate: PromptFieldInput = {
        name: field.name,
        label: field.label,
        type: field.type,
        section: field.section,
        order_position: field.order_position,
        required: field.required,
        complexity: field.complexity,
        help_text: field.help_text,
        placeholder: field.placeholder,
        active: field.active,
        prompt_snippet: field.prompt_snippet
      };
      
      // Convert options to JSON format for Supabase if present
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
      // Prepare update data as a properly typed object
      const fieldToUpdate: Partial<PromptFieldInput> & { id: string } = { id: field.id };
      
      // Only include fields that are present in the input
      if (field.name) fieldToUpdate.name = field.name;
      if (field.label) fieldToUpdate.label = field.label;
      if (field.type) fieldToUpdate.type = field.type;
      if (field.section) fieldToUpdate.section = field.section;
      if (field.order_position) fieldToUpdate.order_position = field.order_position;
      if (field.required !== undefined) fieldToUpdate.required = field.required;
      if (field.complexity) fieldToUpdate.complexity = field.complexity;
      if (field.help_text !== undefined) fieldToUpdate.help_text = field.help_text;
      if (field.placeholder !== undefined) fieldToUpdate.placeholder = field.placeholder;
      if (field.active !== undefined) fieldToUpdate.active = field.active;
      if (field.prompt_snippet !== undefined) fieldToUpdate.prompt_snippet = field.prompt_snippet;
      
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
