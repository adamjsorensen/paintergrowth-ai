
import React from 'react';
import PageLayout from '@/components/PageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import StepIndicator from '@/components/estimate-generator/components/StepIndicator';
import StepRenderer from '@/components/estimate-generator/components/StepRenderer';
import { useEstimateFlow } from '@/components/estimate-generator/hooks/useEstimateFlow';
import { ESTIMATE_STEPS } from '@/components/estimate-generator/constants/EstimateSteps';

const EstimateGenerator = () => {
  const { state, handlers, setCurrentStep } = useEstimateFlow();

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
                disabled={
                  (state.currentStep === 1 && Object.keys(state.extractedData).length === 0) ||
                  (state.currentStep === 2 && Object.keys(state.missingInfo).length === 0) ||
                  (state.currentStep === 3 && Object.keys(state.estimateFields).length === 0)
                }
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
