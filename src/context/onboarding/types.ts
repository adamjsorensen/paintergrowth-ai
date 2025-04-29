
import { File } from "@/types/file";

export interface OnboardingFormData {
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
}

export interface OnboardingContextProps {
  currentStep: number;
  formData: OnboardingFormData;
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

export const defaultFormData: OnboardingFormData = {
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

export const TOTAL_STEPS = 4;
