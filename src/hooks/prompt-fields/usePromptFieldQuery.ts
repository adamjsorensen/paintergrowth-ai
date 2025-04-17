
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
        const optionsValue = field.options;
        
        if (field.type === 'matrix-selector') {
          // For matrix fields, ensure we have the proper structure
          if (typeof optionsValue === 'object' && optionsValue !== null) {
            if ('rows' in optionsValue && 'columns' in optionsValue) {
              // Ensure the type discriminator is present
              parsedOptions = { ...optionsValue, type: 'matrix-config' };
            } else if ('options' in optionsValue && 
                      typeof optionsValue.options === 'object' && 
                      optionsValue.options !== null &&
                      'rows' in optionsValue.options && 
                      'columns' in optionsValue.options) {
              // Handle nested options structure that sometimes comes from the database
              parsedOptions = { ...optionsValue.options, type: 'matrix-config' };
            } else {
              // Fallback to default config
              console.warn(`Invalid matrix config for field ${field.id}, using default`);
              parsedOptions = createDefaultMatrixConfig();
            }
          } else {
            parsedOptions = createDefaultMatrixConfig();
          }
        } else if (['select', 'checkbox-group', 'multi-select'].includes(field.type)) {
          // For option-based fields
          if (typeof optionsValue === 'object' && optionsValue !== null) {
            if (Array.isArray(optionsValue)) {
              parsedOptions = optionsValue;
            } else if ('options' in optionsValue && Array.isArray(optionsValue.options)) {
              parsedOptions = optionsValue.options;
            }
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
      sectionId: field.section,
      modalStep: field.modal_step
    };
  });
};
