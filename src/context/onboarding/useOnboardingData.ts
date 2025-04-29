
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { defaultFormData, OnboardingFormData } from './types';
import { User } from '@supabase/supabase-js';

export const useOnboardingData = (user: User | null) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingFormData>(defaultFormData);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
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
            avatarFile: null,
            logoFile: null,
          });
          
          // Set avatar preview if available
          if (profileData.avatar_url) {
            setAvatarPreview(profileData.avatar_url);
          }
          
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
            
            // Set logo preview if available
            if (companyData.logo_url) {
              setLogoPreview(companyData.logo_url);
            }
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
  
  const setAvatarFile = (file: File | null) => {
    setFormData(prev => ({
      ...prev,
      avatarFile: file,
    }));
    
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setAvatarPreview(objectUrl);
    }
  };
  
  const setLogoFile = (file: File | null) => {
    setFormData(prev => ({
      ...prev,
      logoFile: file,
    }));
    
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setLogoPreview(objectUrl);
    }
  };
  
  return {
    currentStep,
    setCurrentStep,
    formData,
    setFormData,
    setFormValue,
    setKeywords,
    setAvatarFile,
    setLogoFile,
    avatarPreview,
    logoPreview
  };
};
