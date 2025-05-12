import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mic, FileText, ArrowRight } from 'lucide-react';
import ModalProjectType from '@/components/estimate-generator/ModalProjectType';
import Recorder from '@/components/estimate-generator/Recorder';
import Transcriber from '@/components/estimate-generator/Transcriber';
import SummaryChecker from '@/components/estimate-generator/SummaryChecker';
import EstimateReview from '@/components/estimate-generator/EstimateReview';

// Define the steps in the wizard
const STEPS = [
  { id: 'project-type', label: 'Project Type' },
  { id: 'record', label: 'Record' },
  { id: 'transcribe', label: 'Transcribe' },
  { id: 'check', label: 'Review' },
  { id: 'estimate', label: 'Estimate' }
];

const EstimateGenerator = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [projectType, setProjectType] = useState<'interior' | 'exterior'>('interior');
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(true);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [missingInfo, setMissingInfo] = useState<Record<string, any>>({});
  const [estimateFields, setEstimateFields] = useState<Record<string, any>>({});

  // Handle project type selection
  const handleProjectTypeSelect = (type: 'interior' | 'exterior') => {
    setProjectType(type);
    setIsTypeModalOpen(false);
    setCurrentStep(1); // Move to recording step
  };

  // Handle audio recording completion
  const handleRecordingComplete = (blob: Blob) => {
    setAudioBlob(blob);
    setCurrentStep(2); // Move to transcription step
  };

  // Handle transcription completion
  const handleTranscriptionComplete = (text: string, summaryText: string) => {
    setTranscript(text);
    setSummary(summaryText);
    setCurrentStep(3); // Move to summary checker step
  };

  // Handle missing info completion
  const handleMissingInfoComplete = (info: Record<string, any>) => {
    setMissingInfo(info);
    setCurrentStep(4); // Move to estimate review step
  };

  // Handle estimate completion
  const handleEstimateComplete = (fields: Record<string, any>, finalEstimate: Record<string, any>) => {
    setEstimateFields(fields);
    
    // Save the estimate to localStorage
    const savedEstimates = JSON.parse(localStorage.getItem('estimates') || '[]');
    savedEstimates.push({
      id: Date.now().toString(),
      date: new Date().toISOString(),
      projectType,
      ...finalEstimate
    });
    localStorage.setItem('estimates', JSON.stringify(savedEstimates));
    
    // Log the final estimate
    console.log('Final estimate:', finalEstimate);
    
    // Navigate to dashboard or show success message
    navigate('/dashboard');
  };

  // Render the current step
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <ModalProjectType 
            isOpen={isTypeModalOpen} 
            onSelect={handleProjectTypeSelect} 
          />
        );
      case 1:
        return (
          <Recorder 
            onComplete={handleRecordingComplete} 
          />
        );
      case 2:
        return (
          <Transcriber 
            audioBlob={audioBlob} 
            onComplete={handleTranscriptionComplete} 
          />
        );
      case 3:
        return (
          <SummaryChecker 
            summary={summary} 
            transcript={transcript}
            onComplete={handleMissingInfoComplete} 
          />
        );
      case 4:
        return (
          <EstimateReview 
            transcript={transcript}
            summary={summary}
            missingInfo={missingInfo}
            projectType={projectType}
            onComplete={handleEstimateComplete} 
          />
        );
      default:
        return null;
    }
  };

  return (
    <PageLayout title="Voice-Driven Estimate Generator">
      <div className="container max-w-4xl mx-auto">
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Create an Estimate with Voice</CardTitle>
            <CardDescription>
              Record your voice, describe the project, and we'll generate an estimate for you
            </CardDescription>
            
            {/* Step indicator */}
            <div className="mt-6">
              <div className="flex justify-between">
                {STEPS.map((step, index) => (
                  <div 
                    key={step.id} 
                    className="flex flex-col items-center"
                  >
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                        index < currentStep 
                          ? 'bg-green-500 text-white' 
                          : index === currentStep 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {index < currentStep ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span className={`text-xs ${
                      index === currentStep ? 'text-blue-600 font-medium' : 'text-gray-500'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
              <div className="relative mt-2">
                <div className="absolute top-0 left-0 h-1 bg-gray-200 w-full rounded"></div>
                <div 
                  className="absolute top-0 left-0 h-1 bg-blue-600 rounded transition-all duration-300" 
                  style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6">
            {renderStep()}
          </CardContent>
          
          {currentStep > 0 && currentStep < STEPS.length - 1 && (
            <CardFooter className="flex justify-between border-t pt-6">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              >
                Back
              </Button>
              
              <Button 
                onClick={() => setCurrentStep(Math.min(STEPS.length - 1, currentStep + 1))}
                disabled={
                  (currentStep === 1 && !audioBlob) || 
                  (currentStep === 2 && !transcript) ||
                  (currentStep === 3 && Object.keys(missingInfo).length === 0)
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