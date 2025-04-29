
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
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
  FormDescription,
} from '@/components/ui/form';
import { useOnboarding } from '@/context/onboarding/OnboardingContext';
import StepNavigation from '../StepNavigation';

const formSchema = z.object({
  preferredTone: z.string(),
  keyword: z.string().optional(),
});

const PreferencesStep: React.FC = () => {
  const { formData, setFormValue, prevStep, completeOnboarding, isSubmitting, setKeywords } = useOnboarding();
  const [currentKeyword, setCurrentKeyword] = useState('');
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      preferredTone: formData.preferredTone || 'professional',
      keyword: '',
    },
  });
  
  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setFormValue('preferredTone', values.preferredTone);
    await completeOnboarding();
  };
  
  const addKeyword = () => {
    if (currentKeyword && currentKeyword.trim() !== '') {
      const newKeywords = [...formData.keywords, currentKeyword.trim()];
      setKeywords(newKeywords);
      setCurrentKeyword('');
    }
  };
  
  const removeKeyword = (index: number) => {
    const newKeywords = [...formData.keywords];
    newKeywords.splice(index, 1);
    setKeywords(newKeywords);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword();
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-6">
        <h2 className="text-lg text-gray-700 mb-4">Content Preferences</h2>
        <p className="text-gray-600 text-sm">
          These final settings help us generate proposals that match your company's tone and style.
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="preferredTone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Communication Tone</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="friendly">Friendly & Approachable</SelectItem>
                    <SelectItem value="professional">Professional & Formal</SelectItem>
                    <SelectItem value="casual">Casual & Conversational</SelectItem>
                    <SelectItem value="technical">Technical & Detailed</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  This sets the tone of voice used in your proposals
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="space-y-2">
            <FormLabel>Brand Keywords</FormLabel>
            <div className="flex">
              <Input
                placeholder="e.g., quality, reliable, experienced"
                value={currentKeyword}
                onChange={(e) => setCurrentKeyword(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1"
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={addKeyword}
                className="ml-2"
              >
                Add
              </Button>
            </div>
            <FormDescription>
              Enter words that describe your brand's values and qualities
            </FormDescription>
            
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.keywords.map((keyword, index) => (
                <Badge key={index} variant="secondary" className="px-2 py-1 text-sm">
                  {keyword}
                  <button 
                    type="button" 
                    onClick={() => removeKeyword(index)}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    <X size={14} />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="pt-8">
            <p className="bg-green-50 p-4 rounded-lg text-green-700 text-sm">
              <strong>You're almost done!</strong> Click "Complete" below to finish setting up your account and start using Paintergrowth.ai.
            </p>
          </div>
          
          <StepNavigation
            onNext={form.handleSubmit(handleSubmit)}
            onPrev={prevStep}
            canGoNext={true}
            canGoPrev={true}
            isLastStep={true}
            isSubmitting={isSubmitting}
          />
        </form>
      </Form>
    </motion.div>
  );
};

export default PreferencesStep;
