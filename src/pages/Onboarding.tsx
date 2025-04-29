
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import OnboardingLayout from '@/components/onboarding/OnboardingLayout';
import OnboardingStepRenderer from '@/components/onboarding/OnboardingStepRenderer';
import { OnboardingProvider, useOnboarding } from '@/context/OnboardingContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

// Wrapper component that provides the OnboardingContext
const OnboardingPage: React.FC = () => {
  const { user, isLoading } = useAuth();

  // Check if user has completed onboarding
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('onboarding_completed, onboarding_step')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  if (isLoading || profileLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  // If user has completed onboarding, redirect to dashboard
  if (profileData?.onboarding_completed) {
    return <Navigate to="/dashboard" />;
  }

  const stepTitles = [
    'Welcome to Paintergrowth.ai',
    'Personal Profile',
    'Business Information',
    'Preferences',
  ];

  const stepSubtitles = [
    'Let\'s get started with your account setup',
    'Tell us about yourself',
    'Tell us about your business',
    'Set your content preferences',
  ];

  return (
    <OnboardingProvider>
      <OnboardingContent 
        titles={stepTitles} 
        subtitles={stepSubtitles} 
      />
    </OnboardingProvider>
  );
};

// Inner component that uses the OnboardingContext
const OnboardingContent: React.FC<{ 
  titles: string[], 
  subtitles: string[] 
}> = ({ titles, subtitles }) => {
  const { currentStep } = useOnboarding();
  
  return (
    <OnboardingLayout
      currentStep={currentStep}
      totalSteps={4}
      title={titles[currentStep - 1]}
      subtitle={subtitles[currentStep - 1]}
    >
      <OnboardingStepRenderer />
    </OnboardingLayout>
  );
};

export default OnboardingPage;
