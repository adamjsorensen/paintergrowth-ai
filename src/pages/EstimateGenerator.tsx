
import React, { useState } from 'react';
import PageLayout from '@/components/PageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, RefreshCcw } from 'lucide-react';
import StepIndicator from '@/components/estimate-generator/components/StepIndicator';
import MobileStepIndicator from '@/components/estimate-generator/components/MobileStepIndicator';
import StepRenderer from '@/components/estimate-generator/components/StepRenderer';
import StartOverDialog from '@/components/estimate-generator/components/StartOverDialog';
import { useEstimateFlow } from '@/components/estimate-generator/hooks/useEstimateFlow';
import { ESTIMATE_STEPS } from '@/components/estimate-generator/constants/EstimateSteps';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const EstimateGenerator = () => {
  const { state, handlers, setCurrentStep, restartWorkflow } = useEstimateFlow();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [showStartOverDialog, setShowStartOverDialog] = useState(false);

  // Adjust step logic for mobile flow (skip step 3 since it's combined with step 2)
  const getMaxStep = () => isMobile ? 3 : 4;
  const canGoBack = state.currentStep > 0 && state.currentStep < getMaxStep();
  const canGoForward = state.currentStep > 0 && state.currentStep < getMaxStep();
  
  const isStepComplete = () => {
    switch (state.currentStep) {
      case 1: return Object.keys(state.extractedData).length > 0;
      case 2: 
        // On mobile, step 2 is now the combined ReviewEditStep, so completion means estimate is ready
        if (isMobile) {
          return Object.keys(state.estimateFields).length > 0;
        }
        // On desktop, step 2 is still just missing info
        return Object.keys(state.missingInfo).length > 0;
      case 3: 
        // Only applies to desktop
        return !isMobile && Object.keys(state.estimateFields).length > 0;
      default: return true;
    }
  };

  const handleContinue = () => {
    // Skip step 3 on mobile since it's combined with step 2
    if (isMobile && state.currentStep === 2) {
      setCurrentStep(4); // Jump to content generation
    } else {
      setCurrentStep(Math.min(ESTIMATE_STEPS.length - 1, state.currentStep + 1));
    }
  };

  const handleBack = () => {
    // Handle back navigation properly for mobile
    if (isMobile && state.currentStep === 4) {
      setCurrentStep(2); // Jump back to ReviewEditStep
    } else {
      setCurrentStep(Math.max(0, state.currentStep - 1));
    }
  };

  const handleStartOver = () => {
    setShowStartOverDialog(true);
  };

  const confirmStartOver = () => {
    restartWorkflow();
    setShowStartOverDialog(false);
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header - only show for steps that need it */}
        {state.currentStep !== 2 && (
          <div className="bg-white border-b border-gray-200 px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold">Estimate Generator</h1>
              {state.currentStep > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleStartOver}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <RefreshCcw className="h-4 w-4 mr-1" />
                  Start Over
                </Button>
              )}
            </div>
            <MobileStepIndicator steps={ESTIMATE_STEPS} currentStep={state.currentStep} />
          </div>
        )}

        {/* Mobile Content */}
        <div className="flex-1">
          <StepRenderer state={state} handlers={handlers} />
        </div>

        {/* Mobile Footer Navigation - hide for ReviewEditStep since it has its own navigation */}
        {(canGoBack || canGoForward) && state.currentStep !== 2 && (
          <div className="bg-white border-t border-gray-200 p-4 safe-area-pb">
            <div className="flex gap-3">
              {canGoBack && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1 min-h-[56px] text-base font-medium"
                  size="lg"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Back
                </Button>
              )}
              
              {canGoForward && (
                <Button
                  onClick={handleContinue}
                  disabled={!isStepComplete()}
                  className="flex-1 min-h-[56px] text-base font-medium"
                  size="lg"
                >
                  Continue
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        )}

        <StartOverDialog
          isOpen={showStartOverDialog}
          onClose={() => setShowStartOverDialog(false)}
          onConfirm={confirmStartOver}
        />
      </div>
    );
  }

  return (
    <PageLayout title="Voice-Driven Estimate Generator">
      <div className="container max-w-4xl mx-auto">
        <Card className="border-none shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl font-bold">Create an Estimate with Voice</CardTitle>
                <CardDescription>
                  Record audio, upload files, or paste a transcript to generate an estimate
                </CardDescription>
              </div>
              {state.currentStep > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStartOver}
                  className="ml-4 text-gray-600 hover:text-gray-900"
                >
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Start Over
                </Button>
              )}
            </div>
            
            <StepIndicator steps={ESTIMATE_STEPS} currentStep={state.currentStep} />
          </CardHeader>
          
          <CardContent className="pt-6">
            <StepRenderer state={state} handlers={handlers} />
          </CardContent>
          
          {state.currentStep > 0 && state.currentStep < 4 && (
            <CardFooter className="flex justify-between border-t pt-6">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(Math.max(0, state.currentStep - 1))}
              >
                Back
              </Button>
              
              <Button 
                onClick={() => setCurrentStep(Math.min(ESTIMATE_STEPS.length - 1, state.currentStep + 1))}
                disabled={!isStepComplete()}
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          )}
        </Card>

        <StartOverDialog
          isOpen={showStartOverDialog}
          onClose={() => setShowStartOverDialog(false)}
          onConfirm={confirmStartOver}
        />
      </div>
    </PageLayout>
  );
};

export default EstimateGenerator;
