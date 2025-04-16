
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PromptField } from './types';
import { FieldConfig, isMatrixConfig, createDefaultMatrixConfig } from '@/types/prompt-templates';

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
  return promptFields.map(field => {
    // Parse options safely based on field type
    let parsedOptions: any = [];
    
    if (field.options) {
      try {
        if (field.type === 'matrix-selector') {
          // For matrix fields, ensure we have the proper structure
          const options = typeof field.options === 'string' 
            ? JSON.parse(field.options) 
            : field.options;
            
          // Check if options already has the expected structure
          if (options && 'rows' in options && 'columns' in options) {
            // Ensure the type discriminator is present
            parsedOptions = { ...options, type: 'matrix-config' };
          } else if (options && options.options && 'rows' in options.options && 'columns' in options.options) {
            // Handle nested options structure that sometimes comes from the database
            parsedOptions = { ...options.options, type: 'matrix-config' };
          } else {
            // Fallback to default config
            console.warn(`Invalid matrix config for field ${field.id}, using default`);
            parsedOptions = createDefaultMatrixConfig();
          }
        } else if (['select', 'checkbox-group', 'multi-select'].includes(field.type)) {
          // For option-based fields
          if (Array.isArray(field.options)) {
            parsedOptions = field.options;
          } else if (field.options.options && Array.isArray(field.options.options)) {
            // Handle nested options structure
            parsedOptions = field.options.options;
          }
        }
      } catch (e) {
        console.error(`Error parsing options for field ${field.id}:`, e);
        // Use appropriate fallbacks based on field type
        if (field.type === 'matrix-selector') {
          parsedOptions = createDefaultMatrixConfig();
        }
      }
    }
    
    return {
      id: field.id,
      name: field.name,
      label: field.label,
      type: field.type,
      required: field.required || false,
      complexity: field.complexity || 'basic',
      order: field.order_position,
      helpText: field.help_text,
      placeholder: field.placeholder,
      options: parsedOptions,
      sectionId: field.section
    };
  });
};
