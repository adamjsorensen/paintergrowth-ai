
import * as Yup from 'yup';
import { FieldConfig } from "@/types/prompt-templates";
import { useToast } from "@/hooks/use-toast";

export const getValidationSchema = (stepFields: FieldConfig[]) => {
  const schema: Record<string, any> = {};
  
  stepFields.forEach(field => {
    if (field.required) {
      switch (field.type) {
        case 'text':
        case 'textarea':
          schema[field.name] = Yup.string().required(`${field.label} is required`);
          break;
        case 'number':
          schema[field.name] = Yup.number().required(`${field.label} is required`);
          break;
        case 'select':
          schema[field.name] = Yup.string().required(`${field.label} is required`);
          break;
        case 'multi-select':
        case 'checkbox-group':
          schema[field.name] = Yup.array().min(1, `At least one ${field.label} option is required`);
          break;
        case 'scope-of-work':
          schema[field.name] = Yup.array().min(1, `At least one scope item is required`).test(
            'has-content',
            `${field.label} items must have content`,
            (value) => value?.every(item => item.service && String(item.price))
          );
          break;
        default:
          schema[field.name] = Yup.mixed().required(`${field.label} is required`);
      }
    }
  });
  
  return Yup.object().shape(schema);
};

export const validateStep = async (
  stepIndex: number,
  steps: { fields: FieldConfig[] }[],
  fieldValues: Record<string, any>,
  toast: ReturnType<typeof useToast>['toast']
) => {
  if (stepIndex >= steps.length) return true;
  
  const currentStepFields = steps[stepIndex].fields;
  const requiredFields = currentStepFields.filter(field => field.required);
  
  if (requiredFields.length === 0) return true;
  
  try {
    const validationSchema = getValidationSchema(currentStepFields);
    const currentValues = {};
    currentStepFields.forEach(field => {
      currentValues[field.name] = fieldValues[field.name];
    });
    
    await validationSchema.validate(currentValues, { abortEarly: false });
    return true;
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      error.inner.forEach(err => {
        toast({
          title: "Validation Error",
          description: err.message,
          variant: "destructive",
        });
      });
    } else {
      toast({
        title: "Error",
        description: "Please check required fields",
        variant: "destructive",
      });
    }
    return false;
  }
};
