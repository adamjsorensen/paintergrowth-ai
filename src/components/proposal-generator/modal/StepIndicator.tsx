
import React from 'react';

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

export default StepIndicator;
