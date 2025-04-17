
import React, { useEffect } from 'react';
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import StepIndicator from './StepIndicator';
import { ModalStep } from './modalTypes';
import FormFieldRenderer from '../FormFieldRenderer';
import { FieldConfig } from '@/types/prompt-templates';

interface ModalContentProps {
  currentStep: number;
  steps: ModalStep[];
  currentStepData: ModalStep | undefined;
  currentFields: FieldConfig[];
  fieldValues: Record<string, any>;
  onFieldChange: (fieldName: string, value: any) => void;
  handleNext: () => void;
  handleBack: () => void;
  getNextButtonText: (stepIndex: number) => string;
}

const ModalContent = ({
  currentStep,
  steps,
  currentStepData,
  currentFields,
  fieldValues,
  onFieldChange,
  handleNext,
  handleBack,
  getNextButtonText
}: ModalContentProps) => {
  const stepTitles = steps.map(step => step.title);
  
  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Using Tab + modifiers for navigation to avoid conflicts with form fields
      if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'Backspace' && e.ctrlKey) {
        e.preventDefault();
        handleBack();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleNext, handleBack]);

  return (
    <>
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
              onChange={(value) => onFieldChange(field.name, value)}
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
        <div className="text-xs text-muted-foreground flex items-center">
          <kbd className="px-2 py-1 bg-muted rounded text-xs mr-1">Ctrl</kbd>
          +
          <kbd className="px-2 py-1 bg-muted rounded text-xs mx-1">Enter</kbd>
          to continue
        </div>
        <Button onClick={handleNext}>
          {getNextButtonText(currentStep)}
        </Button>
      </div>
    </>
  );
};

export default ModalContent;
