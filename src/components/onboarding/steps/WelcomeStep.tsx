
import React from 'react';
import { motion } from 'framer-motion';
import { useOnboarding } from '@/context/onboarding/OnboardingContext';
import StepNavigation from '../StepNavigation';

const WelcomeStep: React.FC = () => {
  const { nextStep, isSubmitting } = useOnboarding();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <img 
            src="/lovable-uploads/e405d1e9-2ec0-462c-98ec-4ccf56d2ae99.png" 
            alt="Welcome to Paintergrowth.ai" 
            className="h-32 w-auto" 
          />
        </div>
        
        <h2 className="text-2xl font-semibold text-gray-800">Welcome to Paintergrowth.ai</h2>
        <p className="mt-4 text-gray-600">
          Your AI-powered assistant for creating professional painting proposals. We'll help you save time, win more projects, and grow your business.
        </p>
      </div>
      
      <div className="space-y-4 pt-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-700 mb-2">What you'll be able to do:</h3>
          <ul className="space-y-2">
            <li className="flex items-start">
              <svg className="h-5 w-5 text-blue-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Generate professional-looking proposals in minutes</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-blue-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Create personalized content for each client</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-blue-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Manage and store all your proposals in one place</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-blue-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Easily print or share proposals with clients</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="pt-6">
        <p className="text-center text-gray-600 mb-6">
          Let's get started by setting up your account to personalize your experience.
        </p>
        <StepNavigation
          onNext={nextStep}
          onPrev={() => {}}
          canGoNext={true}
          canGoPrev={false}
          isLastStep={false}
          isSubmitting={isSubmitting}
        />
      </div>
    </motion.div>
  );
};

export default WelcomeStep;
