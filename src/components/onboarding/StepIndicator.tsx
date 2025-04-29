
import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className="flex justify-center">
      <div className="flex items-center space-x-2">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <React.Fragment key={step}>
            <div
              className={`relative flex h-8 w-8 items-center justify-center rounded-full ${
                step === currentStep
                  ? 'bg-paintergrowth-600 text-white'
                  : step < currentStep
                  ? 'bg-paintergrowth-200 text-paintergrowth-700'
                  : 'bg-gray-100 text-gray-400'
              } text-sm font-medium`}
            >
              {step < currentStep ? (
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                step
              )}
            </div>
            {step < totalSteps && (
              <div
                className={`h-[2px] w-12 ${
                  step < currentStep ? 'bg-paintergrowth-600' : 'bg-gray-200'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default StepIndicator;
