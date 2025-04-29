
import React, { createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { useOnboardingData } from './useOnboardingData';
import { useOnboardingOperations } from './useOnboardingOperations';
import { OnboardingContextProps, TOTAL_STEPS } from './types';

const OnboardingContext = createContext<OnboardingContextProps | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const {
    currentStep,
    setCurrentStep,
    formData,
    setFormValue,
    setKeywords,
    setAvatarFile,
    setLogoFile,
    avatarPreview,
    logoPreview
  } = useOnboardingData(user);
  
  const {
    isSubmitting,
    nextStep,
    prevStep,
    saveAndContinue,
    completeOnboarding
  } = useOnboardingOperations(
    user,
    currentStep,
    setCurrentStep,
    formData
  );

  return (
    <OnboardingContext.Provider
      value={{
        currentStep,
        formData,
        setFormValue,
        nextStep,
        prevStep,
        isSubmitting,
        saveAndContinue,
        completeOnboarding,
        setKeywords,
        setAvatarFile,
        setLogoFile,
        avatarPreview,
        logoPreview,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
