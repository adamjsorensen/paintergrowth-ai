
import { toast as toastFn } from '@/components/ui/use-toast';
import { ModalStep } from './modalTypes';

export const validateStep = async (
  currentStep: number,
  steps: ModalStep[],
  fieldValues: Record<string, any>,
  toast: typeof toastFn
): Promise<boolean> => {
  // Skip validation if steps aren't loaded yet
  if (!steps || steps.length === 0) return true;
  
  const currentStepData = steps[currentStep];
  if (!currentStepData) return true;
  
  // Get required fields for this step
  const requiredFields = currentStepData.fields.filter(field => field.required);
  
  // If no required fields, step is valid
  if (requiredFields.length === 0) return true;
  
  // Check if all required fields have values
  const missingFields = requiredFields.filter(field => {
    const value = fieldValues[field.name];
    if (value === undefined || value === null || value === '') return true;
    if (Array.isArray(value) && value.length === 0) return true;
    return false;
  });
  
  if (missingFields.length > 0) {
    toast({
      title: "Missing required information",
      description: `Please fill in: ${missingFields.map(f => f.label).join(', ')}`,
      variant: "destructive",
    });
    return false;
  }
  
  return true;
};
