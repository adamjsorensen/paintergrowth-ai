
import { useState, useEffect, useCallback, useRef } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { FieldConfig } from "@/types/prompt-templates";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useGroupedPromptFields, ModalStepType, getModalSteps } from '@/hooks/prompt-fields/useGroupedPromptFields';
import ConfirmationDialog from './modal/ConfirmationDialog';
import ModalContent from './modal/ModalContent';
import { validateStep } from './modal/ValidationHelper';

interface ProposalBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  fields: FieldConfig[];
  values: Record<string, any>;
  onValueChange: (fieldName: string, value: any) => void;
  onSubmit: () => Promise<void>;
  checkRequiredFields?: (modalStep: string) => boolean;
  stepCompleted?: Record<string, boolean>;
  initialStep?: number;
}

export type { ProposalBuilderModalProps };

const ProposalBuilderModal = ({ 
  isOpen, 
  onClose, 
  fields = [], 
  values,
  onValueChange,
  onSubmit,
  checkRequiredFields,
  stepCompleted,
  initialStep = 0
}: ProposalBuilderModalProps) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const isMobile = useMediaQuery("(max-width: 640px)");
  const { toast } = useToast();
  
  const groupedFields = useGroupedPromptFields(fields);
  const modalSteps = getModalSteps(groupedFields);

  // Map step types to field arrays and titles for easier access
  const stepData = modalSteps.map(stepType => ({
    type: stepType,
    title: stepType === 'style' ? 'Style Preferences' : 'Scope of Work',
    fields: groupedFields[stepType]
  }));
  
  // Store the last active step in session storage
  const saveCurrentStep = () => {
    if (currentStep > 0) {
      sessionStorage.setItem('proposalModalStep', currentStep.toString());
    }
  };

  useEffect(() => {
    if (isOpen) {
      // When opening, preserve the initialStep (which might be restored from session)
      setCurrentStep(initialStep);
      setHasUnsavedChanges(false);
    }
  }, [isOpen, initialStep]);

  const handleFieldChange = useCallback((fieldName: string, value: any) => {
    setHasUnsavedChanges(true);
    onValueChange(fieldName, value);
  }, [onValueChange, setHasUnsavedChanges]);

  const handleNext = async () => {
    // Check if the current step is valid
    if (stepData[currentStep]) {
      const stepType = stepData[currentStep].type;
      
      // If we have a validation function, use it
      if (checkRequiredFields) {
        const isValid = checkRequiredFields(stepType);
        if (!isValid) {
          toast({
            title: "Required Fields",
            description: "Please fill in all required fields before continuing.",
            variant: "destructive",
          });
          return;
        }
      }
    }
    
    if (currentStep < stepData.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      // Save progress when advancing steps
      sessionStorage.setItem('proposalModalStep', nextStep.toString());
    } else {
      // Last step completed, submit form
      setHasUnsavedChanges(false);
      sessionStorage.removeItem('proposalModalStep'); // Clear on completion
      await onSubmit();
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      // Save progress when going back
      sessionStorage.setItem('proposalModalStep', prevStep.toString());
    }
  };

  const handleCloseAttempt = () => {
    // Save the current step before potentially closing
    saveCurrentStep();
    
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
    if (stepIndex >= stepData.length - 1) {
      return "Continue to Proposal Builder";
    }
    
    // Check if the next step has required fields
    if (stepIndex + 1 < stepData.length) {
      const nextStepFields = stepData[stepIndex + 1].fields;
      const hasRequiredFields = nextStepFields.some(field => field.required);
      return hasRequiredFields ? "Next" : "Skip";
    }
    
    return "Next";
  };

  if (stepData.length === 0) return null;

  const currentStepData = stepData[currentStep];
  const currentFields = currentStepData?.fields || [];

  const contentProps = { 
    className: isMobile 
      ? "max-h-[90vh] max-w-[95vw] w-full overflow-y-auto py-6 px-4 flex flex-col"
      : "max-h-[90vh] max-w-3xl w-full overflow-y-auto p-6 flex flex-col"
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleCloseAttempt}>
        <DialogContent {...contentProps}>
          <ModalContent 
            currentStep={currentStep}
            steps={stepData}
            currentStepData={currentStepData}
            currentFields={currentFields}
            fieldValues={values}
            onFieldChange={handleFieldChange}
            handleNext={handleNext}
            handleBack={handleBack}
            getNextButtonText={getNextButtonText}
          />
        </DialogContent>
      </Dialog>
      
      <ConfirmationDialog 
        isOpen={showConfirmation}
        onClose={handleCancelClose}
        onConfirm={handleConfirmClose}
      />
    </>
  );
};

export default ProposalBuilderModal;
