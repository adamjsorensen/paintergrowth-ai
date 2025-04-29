
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { uploadFile } from './uploadsHelper';
import { User } from '@supabase/supabase-js';
import { OnboardingFormData } from './types';

export const useOnboardingOperations = (
  user: User | null,
  currentStep: number,
  setCurrentStep: (step: number) => void,
  formData: OnboardingFormData
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };
  
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const saveAndContinue = async () => {
    if (!user?.id) return;
    setIsSubmitting(true);
    
    try {
      // Upload avatar if provided
      let avatarUrl = null;
      if (formData.avatarFile) {
        avatarUrl = await uploadFile(formData.avatarFile, 'avatars', user.id, user.id);
      }
      
      // Upload logo if provided
      let logoUrl = null;
      if (formData.logoFile) {
        logoUrl = await uploadFile(formData.logoFile, 'company-logos', user.id, user.id);
      }
      
      // Update user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          job_title: formData.jobTitle,
          business_name: formData.businessName,
          location: formData.location,
          onboarding_step: currentStep + 1,
          ...(avatarUrl && { avatar_url: avatarUrl })
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
            ...(logoUrl && { logo_url: logoUrl })
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
            ...(logoUrl && { logo_url: logoUrl })
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
      
      // Force page refresh to prevent white screen issue
      window.location.href = '/dashboard';
      
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
  
  return {
    isSubmitting,
    nextStep,
    prevStep,
    saveAndContinue,
    completeOnboarding
  };
};
