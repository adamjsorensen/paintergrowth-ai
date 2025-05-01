
import React from 'react';
import { useOnboarding } from '@/context/onboarding/OnboardingContext';
import StepNavigation from '../StepNavigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Building, Upload, Phone, Mail } from 'lucide-react';

const CompanyInfoStep: React.FC = () => {
  const { 
    formData, 
    setFormValue, 
    saveAndContinue, 
    isSubmitting,
    setLogoFile,
    logoPreview
  } = useOnboarding();
  
  const [errors, setErrors] = React.useState({
    businessName: '',
    location: '',
    services: '',
    email: '',
    phone: ''
  });
  
  const validateFields = (): boolean => {
    const newErrors = {
      businessName: '',
      location: '',
      services: '',
      email: '',
      phone: ''
    };
    
    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    // Email validation
    if (formData.email.trim() && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Phone validation - basic check for non-empty if provided
    if (formData.phone.trim() && !/^[0-9+\-() ]{7,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
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
      
      setLogoFile(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center mb-6">
        <div className="mb-4 h-32 w-48 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center overflow-hidden">
          {logoPreview ? (
            <img 
              src={logoPreview} 
              alt="Company Logo" 
              className="max-h-28 max-w-40 object-contain" 
            />
          ) : (
            <Building className="h-12 w-12 text-gray-300" />
          )}
        </div>
        
        <div className="flex items-center">
          <input
            id="logo-upload"
            type="file"
            accept="image/png, image/jpeg, image/jpg"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => document.getElementById('logo-upload')?.click()}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {logoPreview ? 'Change Company Logo' : 'Upload Company Logo'}
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground mt-2">
          Optional: Upload your company logo (JPG or PNG, max 2MB)
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="businessName">Business Name <span className="text-red-500">*</span></Label>
          <Input
            id="businessName"
            value={formData.businessName}
            onChange={(e) => setFormValue('businessName', e.target.value)}
            placeholder="Acme Painting Co."
            className={errors.businessName ? "border-red-500" : ""}
          />
          {errors.businessName && <p className="text-sm text-red-500">{errors.businessName}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location <span className="text-red-500">*</span></Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormValue('location', e.target.value)}
            placeholder="City, State"
            className={errors.location ? "border-red-500" : ""}
          />
          {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Business Email</Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormValue('email', e.target.value)}
              placeholder="contact@yourcompany.com"
              className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
            />
            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Business Phone</Label>
          <div className="relative">
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormValue('phone', e.target.value)}
              placeholder="(123) 456-7890"
              className={`pl-10 ${errors.phone ? "border-red-500" : ""}`}
            />
            <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="services">Services Offered</Label>
          <Textarea
            id="services"
            value={formData.services}
            onChange={(e) => setFormValue('services', e.target.value)}
            placeholder="Interior painting, Exterior painting, Deck staining, etc."
            rows={3}
            className={errors.services ? "border-red-500" : ""}
          />
          {errors.services && <p className="text-sm text-red-500">{errors.services}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="teamSize">Team Size</Label>
          <Select 
            value={formData.teamSize} 
            onValueChange={(value) => setFormValue('teamSize', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select team size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Just me</SelectItem>
              <SelectItem value="2-5">2-5 people</SelectItem>
              <SelectItem value="6-10">6-10 people</SelectItem>
              <SelectItem value="11-20">11-20 people</SelectItem>
              <SelectItem value="21-50">21-50 people</SelectItem>
              <SelectItem value="51+">51+ people</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <StepNavigation
        onNext={handleContinue}
        onPrev={() => {}}
        canGoNext={true}
        canGoPrev={true}
        isLastStep={false}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default CompanyInfoStep;
