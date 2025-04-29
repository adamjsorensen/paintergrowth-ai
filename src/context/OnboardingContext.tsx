
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';

interface OnboardingContextProps {
  currentStep: number;
  formData: {
    fullName: string;
    jobTitle: string;
    businessName: string;
    location: string;
    services: string;
    teamSize: string;
    preferredTone: string;
    keywords: string[];
  };
  setFormValue: (field: string, value: any) => void;
  nextStep: () => void;
  prevStep: () => void;
  isSubmitting: boolean;
  saveAndContinue: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  setKeywords: (keywords: string[]) => void;
}

const TOTAL_STEPS = 4;

const defaultFormData = {
  fullName: '',
  jobTitle: '',
  businessName: '',
  location: '',
  services: '',
  teamSize: '1',
  preferredTone: 'professional',
  keywords: [],
};

const OnboardingContext = createContext<OnboardingContextProps | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Load saved onboarding data
  useEffect(() => {
    const fetchSavedData = async () => {
      if (!user?.id) return;
      
      try {
        // Get user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (profileError) throw profileError;
        
        if (profileData) {
          const savedStep = profileData.onboarding_step || 1;
          setCurrentStep(savedStep);
          
          // Populate form with existing data
          setFormData({
            fullName: profileData.full_name || '',
            jobTitle: profileData.job_title || '',
            businessName: profileData.business_name || '',
            location: profileData.location || '',
            services: '',
            teamSize: '1',
            preferredTone: 'professional',
            keywords: [],
          });
          
          // Get company profile data if it exists
          const { data: companyData } = await supabase
            .from('company_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();
            
          if (companyData) {
            setFormData(prev => ({
              ...prev,
              businessName: companyData.business_name || prev.businessName,
              location: companyData.location || prev.location,
              services: companyData.services_offered || '',
              teamSize: companyData.team_size || '1',
              preferredTone: companyData.preferred_tone || 'professional',
              keywords: companyData.brand_keywords || [],
            }));
          }
        }
      } catch (error) {
        console.error('Error loading onboarding data:', error);
      }
    };
    
    fetchSavedData();
  }, [user]);
  
  const setFormValue = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };
  
  const setKeywords = (keywords: string[]) => {
    setFormData(prev => ({
      ...prev,
      keywords,
    }));
  };
  
  const nextStep = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
    }
  };
  
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  const saveAndContinue = async () => {
    if (!user?.id) return;
    setIsSubmitting(true);
    
    try {
      // Update user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          job_title: formData.jobTitle,
          business_name: formData.businessName,
          location: formData.location,
          onboarding_step: currentStep + 1,
        })
        .eq('id', user.id);
        
      if (profileError) throw profileError;
      
      // Update or create company profile
      const { data: existingCompany } = await supabase
        .from('company_profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .single();
        
      if (existingCompany) {
        // Update existing company profile
        const { error: companyError } = await supabase
          .from('company_profiles')
          .update({
            business_name: formData.businessName,
            location: formData.location,
            services_offered: formData.services,
            team_size: formData.teamSize,
            preferred_tone: formData.preferredTone,
            brand_keywords: formData.keywords,
          })
          .eq('user_id', user.id);
          
        if (companyError) throw companyError;
      } else {
        // Create new company profile
        const { error: createError } = await supabase
          .from('company_profiles')
          .insert({
            user_id: user.id,
            business_name: formData.businessName,
            location: formData.location,
            services_offered: formData.services,
            team_size: formData.teamSize,
            preferred_tone: formData.preferredTone,
            brand_keywords: formData.keywords,
          });
          
        if (createError) throw createError;
      }
      
      nextStep();
      
    } catch (error: any) {
      toast({
        title: "Failed to save data",
        description: error.message || "An error occurred while saving your information",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const completeOnboarding = async () => {
    if (!user?.id) return;
    setIsSubmitting(true);
    
    try {
      // Mark onboarding as complete
      const { error } = await supabase
        .from('profiles')
        .update({
          onboarding_completed: true,
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      toast({
        title: "Welcome to Paintergrowth.ai!",
        description: "Your onboarding is complete. You're all set to start creating proposals!",
      });
      
      navigate('/dashboard');
      
    } catch (error: any) {
      toast({
        title: "Error completing onboarding",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
