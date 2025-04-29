
import React from 'react';
import { useOnboarding } from '@/context/OnboardingContext';
import WelcomeStep from './steps/WelcomeStep';
import PersonalProfileStep from './steps/PersonalProfileStep';
import CompanyInfoStep from './steps/CompanyInfoStep';
import PreferencesStep from './steps/PreferencesStep';

const OnboardingStepRenderer: React.FC = () => {
  const { currentStep } = useOnboarding();

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <WelcomeStep />;
      case 2:
        return <PersonalProfileStep />;
      case 3:
        return <CompanyInfoStep />;
      case 4:
        return <PreferencesStep />;
      default:
        return <WelcomeStep />;
    }
  };

  return <>{renderStep()}</>;
};

export default OnboardingStepRenderer;
