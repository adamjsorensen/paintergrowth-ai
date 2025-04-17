
import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { FieldConfig } from "@/types/prompt-templates";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { ModalStep, ProposalBuilderModalProps } from './modal/modalTypes';
import ConfirmationDialog from './modal/ConfirmationDialog';
import ModalContent from './modal/ModalContent';
import { validateStep } from './modal/ValidationHelper';

const ProposalBuilderModal = ({ 
  isOpen, 
  onClose, 
  fields = [], 
  fieldValues, 
  onFieldChange,
  onComplete,
  initialStep = 0
}: ProposalBuilderModalProps) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [steps, setSteps] = useState<ModalStep[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const isMobile = useMediaQuery("(max-width: 640px)");
  const { toast } = useToast();
  
  // Store the last active step in session storage
  const saveCurrentStep = () => {
    if (currentStep > 0) {
      sessionStorage.setItem('proposalModalStep', currentStep.toString());
    }
  };

  useEffect(() => {
    const modalSteps = Array.from(
      new Set(
        fields
          .filter(field => field.modalStep && field.modalStep !== 'main')
          .map(field => field.modalStep)
      )
    );

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
      // When opening, preserve the initialStep (which might be restored from session)
      setCurrentStep(initialStep);
      setHasUnsavedChanges(false);
    }
  }, [isOpen, initialStep]);

  const handleFieldChange = useCallback((fieldName: string, value: any) => {
    setHasUnsavedChanges(true);
    onFieldChange(fieldName, value);
  }, [onFieldChange]);

  const handleNext = async () => {
    const isValid = await validateStep(currentStep, steps, fieldValues, toast);
    if (!isValid) return;
    
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      // Save progress when advancing steps
      sessionStorage.setItem('proposalModalStep', nextStep.toString());
    } else {
      setHasUnsavedChanges(false);
      sessionStorage.removeItem('proposalModalStep'); // Clear on completion
      onComplete();
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
            steps={steps}
            currentStepData={currentStepData}
            currentFields={currentFields}
            fieldValues={fieldValues}
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
