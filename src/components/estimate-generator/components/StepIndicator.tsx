
import React from 'react';
import { EstimateStep } from '../types/EstimateTypes';

interface StepIndicatorProps {
  steps: EstimateStep[];
  currentStep: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStep }) => {
  return (
    <div className="mt-6">
      <div className="flex justify-between">
        {steps.map((step, index) => (
          <div 
            key={step.id} 
            className="flex flex-col items-center"
          >
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                index < currentStep 
                  ? 'bg-green-500 text-white' 
                  : index === currentStep 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
              }`}
            >
              {index < currentStep ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                index + 1
              )}
            </div>
            <span className={`text-xs ${
              index === currentStep ? 'text-blue-600 font-medium' : 'text-gray-500'
            }`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
      <div className="relative mt-2">
        <div className="absolute top-0 left-0 h-1 bg-gray-200 w-full rounded"></div>
        <div 
          className="absolute top-0 left-0 h-1 bg-blue-600 rounded transition-all duration-300" 
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

export default StepIndicator;
