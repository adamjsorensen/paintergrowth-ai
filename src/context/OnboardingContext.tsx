
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
    avatarFile: File | null;
    logoFile: File | null;
  };
  setFormValue: (field: string, value: any) => void;
  nextStep: () => void;
  prevStep: () => void;
  isSubmitting: boolean;
  saveAndContinue: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  setKeywords: (keywords: string[]) => void;
  setAvatarFile: (file: File | null) => void;
  setLogoFile: (file: File | null) => void;
  avatarPreview: string | null;
  logoPreview: string | null;
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
  avatarFile: null,
  logoFile: null,
};

const OnboardingContext = createContext<OnboardingContextProps | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
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
  
  const uploadFile = async (file: File, bucket: string, folder: string): Promise<string | null> => {
    if (!user?.id || !file) return null;
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);
        
      return publicUrl;
    } catch (error) {
      console.error(`Error uploading ${bucket} file:`, error);
      return null;
    }
  };
  
  const saveAndContinue = async () => {
    if (!user?.id) return;
    setIsSubmitting(true);
    
    try {
      // Upload avatar if provided
      let avatarUrl = null;
      if (formData.avatarFile) {
        avatarUrl = await uploadFile(formData.avatarFile, 'avatars', user.id);
      }
      
      // Upload logo if provided
      let logoUrl = null;
      if (formData.logoFile) {
        logoUrl = await uploadFile(formData.logoFile, 'company-logos', user.id);
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
