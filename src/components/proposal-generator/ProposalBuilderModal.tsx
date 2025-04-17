import { useState, useEffect, useCallback } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { FieldConfig, ModalStepType } from "@/types/prompt-templates";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import FormFieldRenderer from './FormFieldRenderer';
import * as Yup from 'yup';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
}

const StepIndicator = ({ currentStep, totalSteps, stepTitles }: StepIndicatorProps) => {
  return (
    <div className="flex flex-col space-y-2 mb-6">
      <div className="flex justify-between items-center">
        {stepTitles.map((title, index) => (
          <div 
            key={index}
            className={`flex items-center ${index < currentStep ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <div 
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm
                ${index < currentStep ? 'bg-primary text-white' : 
                  index === currentStep ? 'bg-primary/20 text-primary border border-primary' : 
                  'bg-muted text-muted-foreground'}
              `}
            >
              {index + 1}
            </div>
            {index < stepTitles.length - 1 && (
              <div className={`h-0.5 w-12 md:w-24 mx-1 ${index < currentStep ? 'bg-primary' : 'bg-muted'}`} />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between px-2">
        {stepTitles.map((title, index) => (
          <span key={index} className={`text-xs ${index === currentStep ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
            {title}
          </span>
        ))}
      </div>
    </div>
  );
};

interface ModalStep {
  type: ModalStepType;
  title: string;
  fields: FieldConfig[];
}

interface ProposalBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  fields: FieldConfig[];
  fieldValues: Record<string, any>;
  onFieldChange: (fieldName: string, value: any) => void;
  onComplete: () => void;
}

const ProposalBuilderModal = ({ 
  isOpen, 
  onClose, 
  fields = [], 
  fieldValues, 
  onFieldChange,
  onComplete
}: ProposalBuilderModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<ModalStep[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const isMobile = useMediaQuery("(max-width: 640px)");
  const { toast } = useToast();

  useEffect(() => {
    const modalSteps = Array.from(
      new Set(
        fields
          .filter(field => field.modalStep && field.modalStep !== 'main')
          .map(field => field.modalStep)
      )
    ) as ModalStepType[];

    const stepTitles = {
      'style': 'Style Preferences',
      'scope': 'Scope of Work',
    };

    const newSteps = modalSteps.map(stepType => ({
      type: stepType,
      title: stepTitles[stepType] || stepType.charAt(0).toUpperCase() + stepType.slice(1),
      fields: fields.filter(field => field.modalStep === stepType)
    }));

    setSteps(newSteps);
  }, [fields]);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setHasUnsavedChanges(false);
    }
  }, [isOpen]);

  const handleFieldChange = useCallback((fieldName: string, value: any) => {
    setHasUnsavedChanges(true);
    onFieldChange(fieldName, value);
  }, [onFieldChange]);

  const getValidationSchema = (stepFields: FieldConfig[]) => {
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

  const validateStep = async (stepIndex: number) => {
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

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (!isValid) return;
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setHasUnsavedChanges(false);
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleCloseAttempt = () => {
    if (hasUnsavedChanges) {
      setShowConfirmation(true);
    } else {
      onClose();
    }
  };

  const handleConfirmClose = () => {
    setShowConfirmation(false);
    setHasUnsavedChanges(false);
    onClose();
  };

  const handleCancelClose = () => {
    setShowConfirmation(false);
  };

  const getNextButtonText = (stepIndex: number) => {
    if (stepIndex >= steps.length - 1) {
      return "Continue to Proposal Builder";
    }
    
    const nextStepFields = steps[stepIndex].fields;
    const hasRequiredFields = nextStepFields.some(field => field.required);
    
    return hasRequiredFields ? "Next" : "Skip";
  };

  if (steps.length === 0) return null;

  const currentStepData = steps[currentStep];
  const currentFields = currentStepData?.fields || [];
  const stepTitles = steps.map(step => step.title);

  const ContentComponent = DialogContent;
  const contentProps = { 
    className: isMobile 
      ? "max-h-[90vh] max-w-[95vw] w-full overflow-y-auto py-6 px-4 flex flex-col"
      : "max-h-[90vh] max-w-3xl w-full overflow-y-auto p-6 flex flex-col"
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleCloseAttempt}>
        <ContentComponent {...contentProps}>
          <SheetHeader className="mb-4">
            <SheetTitle className="text-xl font-semibold">{currentStepData?.title || "Proposal Settings"}</SheetTitle>
          </SheetHeader>
          
          {steps.length > 1 && (
            <StepIndicator 
              currentStep={currentStep} 
              totalSteps={steps.length}
              stepTitles={stepTitles}
            />
          )}
          
          <div className="overflow-y-auto pr-1 space-y-6 mb-auto flex-1">
            {currentFields.map(field => (
              <div key={field.id} className={field.type === 'scope-of-work' ? 'col-span-2' : 'col-span-1'}>
                <FormFieldRenderer
                  field={field}
                  value={fieldValues[field.name]}
                  onChange={(value) => handleFieldChange(field.name, value)}
                  isAdvanced={false}
                />
              </div>
            ))}
          </div>
          
          <div className="flex justify-between pt-6 mt-4 border-t sticky bottom-0 bg-background">
            <Button 
              variant="outline" 
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              Back
            </Button>
            <Button onClick={handleNext}>
              {getNextButtonText(currentStep)}
            </Button>
          </div>
        </ContentComponent>
      </Dialog>
      
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-md">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Discard Changes?</h2>
            <p>You have unsaved changes. Are you sure you want to discard them?</p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleCancelClose}>Cancel</Button>
              <Button variant="destructive" onClick={handleConfirmClose}>Discard</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProposalBuilderModal;
