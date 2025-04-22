
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

  // Main structure: header, scrollable content, sticky footer in a full-height flex column.
  return (
    <div className="flex flex-col h-full w-full">
      {/* HEADER */}
      <header className="pt-6 px-6 sm:px-8 flex-shrink-0">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-bold tracking-tight">{currentStepData?.title || "Build your perfect proposal"}</SheetTitle>
          <p className="text-muted-foreground mt-2 text-base">Pick style preferences—or skip straight to the job info.</p>
        </SheetHeader>
        {steps.length > 1 && (
          <StepIndicator 
            currentStep={currentStep} 
            totalSteps={steps.length}
            stepTitles={stepTitles}
          />
        )}
      </header>

      {/* SCROLLABLE MAIN CONTENT */}
      <main 
        className="flex-1 overflow-y-auto px-6 sm:px-8 pb-6"
        id="modal-scrollable-content"
      >
        {currentFields.map((field, index) => (
          <div key={field.id}>
            {index > 0 && field.sectionId !== currentFields[index-1].sectionId && (
              <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent my-6"></div>
            )}
            {field.sectionId && index === 0 || (index > 0 && field.sectionId !== currentFields[index-1].sectionId) ? (
              <h3 className="text-lg font-semibold mb-4 text-gray-800">{field.sectionId}</h3>
            ) : null}
            <div className="group transition-all duration-200 hover:bg-gray-50/80 rounded-lg p-3 -mx-3">
              <FormFieldRenderer
                field={field}
                value={fieldValues[field.name]}
                onChange={(value) => onFieldChange(field.name, value)}
                isAdvanced={false}
              />
            </div>
          </div>
        ))}
      </main>
      
      {/* STICKY FOOTER */}
      <footer className="sticky bottom-0 bg-background/95 backdrop-blur-sm pt-6 px-6 sm:px-8 border-t z-10">
        <div className="flex justify-between items-center pb-6">
          <Button 
            variant="outline" 
            onClick={handleBack}
            disabled={currentStep === 0}
            className="transition-all hover:shadow-sm"
          >
            Back
          </Button>
          <div className="text-xs text-muted-foreground flex items-center">
            <kbd className="px-2 py-1 bg-muted rounded text-xs mr-1">Ctrl</kbd>
            +
            <kbd className="px-2 py-1 bg-muted rounded text-xs mx-1">Enter</kbd>
            to continue
          </div>
          <Button 
            onClick={handleNext}
            className="bg-blue-600 hover:bg-blue-700 transition-all hover:shadow-md"
          >
            {getNextButtonText(currentStep)}
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default ModalContent;
