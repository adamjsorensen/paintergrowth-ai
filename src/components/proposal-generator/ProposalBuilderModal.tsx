
import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { FieldConfig } from "@/types/prompt-templates";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useGroupedPromptFields, getModalSteps } from '@/hooks/prompt-fields/useGroupedPromptFields';
import ConfirmationDialog from './modal/ConfirmationDialog';
import ModalContent from './modal/ModalContent';
import { validateStep } from './modal/ValidationHelper';
import { ProposalBuilderModalProps } from './modal/modalTypes';

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
  
  // Reset the current step when the modal steps change
  useEffect(() => {
    // Ensure the currentStep is not beyond available steps
    if (currentStep >= stepData.length && stepData.length > 0) {
      setCurrentStep(0);
    }
  }, [stepData.length, currentStep]);
  
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
      // Last step completed, just finish the modal
      setHasUnsavedChanges(false);
      sessionStorage.removeItem('proposalModalStep'); // Clear on completion
      if (onSubmit) {
        await onSubmit(); // Save modal state but DO NOT submit main form
      }
      // Only close self
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

  // Debug logging to help diagnose issues
  console.log('Modal Steps:', modalSteps);
  console.log('Current Step:', currentStep);
  console.log('Step Data:', stepData);
  console.log('Grouped Fields:', groupedFields);
  
  const currentStepData = stepData[currentStep];
  const currentFields = currentStepData?.fields || [];

  // Here, we structure modal content as a full-height flex column, header/main/footer.
  // ModalContent is now responsible for setting flex-grow/overflow.
  const contentProps = { 
    className: isMobile 
      ? "flex flex-col h-[90vh] max-h-[90vh] max-w-[95vw] w-full py-0 px-0"
      : "flex flex-col h-[90vh] max-h-[90vh] max-w-3xl w-full py-0 px-0"
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
