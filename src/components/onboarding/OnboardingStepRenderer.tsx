
import React from 'react';
import { useOnboarding } from '@/context/OnboardingContext';
import WelcomeStep from './steps/WelcomeStep';
import PersonalProfileStep from './steps/PersonalProfileStep';
import CompanyInfoStep from './steps/CompanyInfoStep';
import PreferencesStep from './steps/PreferencesStep';
import { AnimatePresence, motion } from 'framer-motion';

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

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        {renderStep()}
      </motion.div>
    </AnimatePresence>
  );
};

export default OnboardingStepRenderer;
