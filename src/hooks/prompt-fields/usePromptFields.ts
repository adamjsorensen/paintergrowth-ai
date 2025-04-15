
import { usePromptFieldQuery, convertToFieldConfig } from './usePromptFieldQuery';
import { usePromptFieldCreate } from './usePromptFieldCreate';
import { usePromptFieldUpdate } from './usePromptFieldUpdate';
import { usePromptFieldDelete } from './usePromptFieldDelete';
import { PromptField } from './types';

export const usePromptFields = () => {
  const { data: fields = [], isLoading, error } = usePromptFieldQuery();
  const createField = usePromptFieldCreate();
  const updateField = usePromptFieldUpdate();
  const deleteField = usePromptFieldDelete();

  return {
    fields,
    isLoading,
    error,
    createField,
    updateField,
    deleteField,
    convertToFieldConfig
  };
};

export type { PromptField };
export * from './types';
