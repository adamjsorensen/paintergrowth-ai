
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PromptField } from './types';
import { FieldConfig } from '@/types/prompt-templates';

export const usePromptFieldQuery = () => {
  return useQuery({
    queryKey: ['promptFields'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prompt_fields')
        .select('*')
        .order('section')
        .order('order_position');

      if (error) throw error;
      return data as PromptField[];
    },
  });
};

// Utility function to convert PromptField array to FieldConfig array
export const convertToFieldConfig = (promptFields: PromptField[]): FieldConfig[] => {
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
    options: field.options ? JSON.parse(JSON.stringify(field.options)).options || [] : [],
    sectionId: field.section
  }));
};
