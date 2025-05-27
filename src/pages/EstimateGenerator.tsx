import React from 'react';
import PageLayout from '@/components/PageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import StepIndicator from '@/components/estimate-generator/components/StepIndicator';
import MobileStepIndicator from '@/components/estimate-generator/components/MobileStepIndicator';
import StepRenderer from '@/components/estimate-generator/components/StepRenderer';
import { useEstimateFlow } from '@/components/estimate-generator/hooks/useEstimateFlow';
import { ESTIMATE_STEPS } from '@/components/estimate-generator/constants/EstimateSteps';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const EstimateGenerator = () => {
  const { state, handlers, setCurrentStep } = useEstimateFlow();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const canGoBack = state.currentStep > 0 && state.currentStep < 4;
  const canGoForward = state.currentStep > 0 && state.currentStep < 4;
  
  const isStepComplete = () => {
    switch (state.currentStep) {
      case 1: return Object.keys(state.extractedData).length > 0;
      case 2: return Object.keys(state.missingInfo).length > 0;
      case 3: return Object.keys(state.estimateFields).length > 0;
      default: return true;
    }
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <h1 className="text-lg font-semibold text-center">Estimate Generator</h1>
          <MobileStepIndicator steps={ESTIMATE_STEPS} currentStep={state.currentStep} />
        </div>

        {/* Mobile Content */}
        <div className="flex-1">
          <StepRenderer state={state} handlers={handlers} />
        </div>

        {/* Mobile Footer Navigation */}
        {(canGoBack || canGoForward) && (
          <div className="bg-white border-t border-gray-200 p-4 safe-area-pb">
            <div className="flex gap-3">
              {canGoBack && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(Math.max(0, state.currentStep - 1))}
                  className="flex-1 min-h-[56px] text-base font-medium"
                  size="lg"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Back
                </Button>
              )}
              
              {canGoForward && (
                <Button
                  onClick={() => setCurrentStep(Math.min(ESTIMATE_STEPS.length - 1, state.currentStep + 1))}
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
      </div>
    );
  }

  return (
    <PageLayout title="Voice-Driven Estimate Generator">
      <div className="container max-w-4xl mx-auto">
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Create an Estimate with Voice</CardTitle>
            <CardDescription>
              Record audio, upload files, or paste a transcript to generate an estimate
            </CardDescription>
            
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
      </div>
    </PageLayout>
  );
};

export default EstimateGenerator;
