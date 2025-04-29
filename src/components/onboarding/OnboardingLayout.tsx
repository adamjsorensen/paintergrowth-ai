
import React from 'react';
import { Card } from '@/components/ui/card';
import { Logo } from './Logo';
import StepIndicator from './StepIndicator';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
}

const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  children,
  currentStep,
  totalSteps,
  title,
  subtitle,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-paintergrowth-50 to-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <div className="mb-8 text-center">
          <Logo />
        </div>
        
        <Card className="p-6 shadow-lg border-paintergrowth-100">
          <div className="mb-6">
            <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && <p className="mt-2 text-gray-600">{subtitle}</p>}
          </div>
          
          {children}
        </Card>
        
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Paintergrowth.ai. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default OnboardingLayout;
