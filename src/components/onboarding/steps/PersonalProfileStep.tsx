
import React from 'react';
import { useOnboarding } from '@/context/onboarding/OnboardingContext';
import StepNavigation from '../StepNavigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Upload, User } from 'lucide-react';

const PersonalProfileStep: React.FC = () => {
  const { 
    formData, 
    setFormValue, 
    saveAndContinue, 
    isSubmitting, 
    setAvatarFile, 
    avatarPreview 
  } = useOnboarding();
  
  const [errors, setErrors] = React.useState({
    fullName: '',
    jobTitle: '',
  });
  
  const validateFields = (): boolean => {
    const newErrors = {
      fullName: '',
      jobTitle: '',
    };
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };
  
  const handleContinue = async () => {
    if (validateFields()) {
      await saveAndContinue();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        alert('Please upload JPG or PNG files only');
        return;
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Please upload an image smaller than 2MB');
        return;
      }
      
      setAvatarFile(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center mb-6">
        <div className="mb-4">
          <Avatar className="h-24 w-24 border-2 border-paintergrowth-100">
            <AvatarImage src={avatarPreview || ''} />
            <AvatarFallback className="bg-paintergrowth-100 text-paintergrowth-600">
              <User className="h-12 w-12" />
            </AvatarFallback>
          </Avatar>
        </div>
        
        <div className="flex items-center">
          <input
            id="avatar-upload"
            type="file"
            accept="image/png, image/jpeg, image/jpg"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => document.getElementById('avatar-upload')?.click()}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {avatarPreview ? 'Change Profile Picture' : 'Upload Profile Picture'}
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground mt-2">
          Optional: Upload a profile picture (JPG or PNG, max 2MB)
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name <span className="text-red-500">*</span></Label>
          <Input
            id="fullName"
            value={formData.fullName}
            onChange={(e) => setFormValue('fullName', e.target.value)}
            placeholder="John Doe"
            className={errors.fullName ? "border-red-500" : ""}
          />
          {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="jobTitle">Job Title <span className="text-red-500">*</span></Label>
          <Input
            id="jobTitle"
            value={formData.jobTitle}
            onChange={(e) => setFormValue('jobTitle', e.target.value)}
            placeholder="Painting Contractor"
            className={errors.jobTitle ? "border-red-500" : ""}
          />
          {errors.jobTitle && <p className="text-sm text-red-500">{errors.jobTitle}</p>}
        </div>
      </div>

      <StepNavigation
        onNext={handleContinue}
        onPrev={() => {}}
        canGoNext={true}
        canGoPrev={false}
        isLastStep={false}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default PersonalProfileStep;
