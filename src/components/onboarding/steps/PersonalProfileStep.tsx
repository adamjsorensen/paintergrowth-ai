
import React from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
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
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  jobTitle: z.string().min(2, 'Job title must be at least 2 characters'),
});

const PersonalProfileStep: React.FC = () => {
  const { formData, setFormValue, nextStep, prevStep, saveAndContinue, isSubmitting } = useOnboarding();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: formData.fullName,
      jobTitle: formData.jobTitle,
    },
  });
  
  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setFormValue('fullName', values.fullName);
    setFormValue('jobTitle', values.jobTitle);
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
        <h2 className="text-lg text-gray-700 mb-4">Tell us about yourself</h2>
        <p className="text-gray-600 text-sm">
          This information helps personalize your proposals and creates a more professional appearance.
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Smith" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="jobTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Position</FormLabel>
                <FormControl>
                  <Input placeholder="Owner / Estimator / Manager" {...field} />
                </FormControl>
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

export default PersonalProfileStep;
