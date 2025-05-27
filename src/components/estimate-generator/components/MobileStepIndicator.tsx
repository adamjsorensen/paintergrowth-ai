
import React from 'react';
import { EstimateStep } from '../types/EstimateTypes';

interface MobileStepIndicatorProps {
  steps: EstimateStep[];
  currentStep: number;
}

const MobileStepIndicator: React.FC<MobileStepIndicatorProps> = ({ steps, currentStep }) => {
  return (
    <div className="flex justify-center items-center py-4">
      <div className="flex space-x-2">
        {steps.map((step, index) => (
          <div 
            key={step.id} 
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              index < currentStep 
                ? 'bg-green-500' 
                : index === currentStep 
                  ? 'bg-blue-600' 
                  : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
      <div className="ml-4 text-sm text-gray-600">
        Step {currentStep + 1} of {steps.length}
      </div>
    </div>
  );
};

export default MobileStepIndicator;
