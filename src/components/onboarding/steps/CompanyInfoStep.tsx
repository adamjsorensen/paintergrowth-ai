
import React from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useOnboarding } from '@/context/OnboardingContext';
import StepNavigation from '../StepNavigation';

const formSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  location: z.string().min(2, 'Location must be at least 2 characters'),
  services: z.string().min(5, 'Please provide a brief description of your services'),
  teamSize: z.string(),
});

const CompanyInfoStep: React.FC = () => {
  const { formData, setFormValue, nextStep, prevStep, saveAndContinue, isSubmitting } = useOnboarding();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: formData.businessName,
      location: formData.location,
      services: formData.services,
      teamSize: formData.teamSize,
    },
  });
  
  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setFormValue('businessName', values.businessName);
    setFormValue('location', values.location);
    setFormValue('services', values.services);
    setFormValue('teamSize', values.teamSize);
    await saveAndContinue();
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-6">
        <h2 className="text-lg text-gray-700 mb-4">Company Information</h2>
        <p className="text-gray-600 text-sm">
          This information will be used to customize your proposals with your business details.
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="businessName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Name</FormLabel>
                <FormControl>
                  <Input placeholder="ABC Painting" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="City, State" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="services"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Services Offered</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Interior and exterior residential painting, cabinet refinishing, etc." 
                    {...field} 
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="teamSize"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Team Size</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select team size" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">Just me</SelectItem>
                    <SelectItem value="2-5">2-5 employees</SelectItem>
                    <SelectItem value="6-10">6-10 employees</SelectItem>
                    <SelectItem value="11-20">11-20 employees</SelectItem>
                    <SelectItem value="21-50">21-50 employees</SelectItem>
                    <SelectItem value="51+">51+ employees</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <StepNavigation
            onNext={form.handleSubmit(handleSubmit)}
            onPrev={prevStep}
            canGoNext={form.formState.isValid}
            canGoPrev={true}
            isLastStep={false}
            isSubmitting={isSubmitting}
          />
        </form>
      </Form>
    </motion.div>
  );
};

export default CompanyInfoStep;
