
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import ModalProjectType from '@/components/estimate-generator/ModalProjectType';
import TranscriptInput from '@/components/audio-transcript/TranscriptInput';
import SummaryChecker from '@/components/estimate-generator/SummaryChecker';
import EstimateReview from '@/components/estimate-generator/EstimateReview';
import EstimateContentGenerator from '@/components/estimate-generator/EstimateContentGenerator';

// Updated steps to include content generation phases
const STEPS = [
  { id: 'project-type', label: 'Project Type' },
  { id: 'input', label: 'Input' },
  { id: 'check', label: 'Review' },
  { id: 'estimate', label: 'Pricing' },
  { id: 'content', label: 'Content' },
  { id: 'edit', label: 'Edit' },
  { id: 'pdf', label: 'PDF' }
];

const EstimateGenerator = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [projectType, setProjectType] = useState<'interior' | 'exterior'>('interior');
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(true);
  const [extractedData, setExtractedData] = useState<Record<string, any>>({});
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [missingInfo, setMissingInfo] = useState<Record<string, any>>({});
  const [estimateFields, setEstimateFields] = useState<Record<string, any>>({});
  const [lineItems, setLineItems] = useState<any[]>([]);
  const [totals, setTotals] = useState<Record<string, any>>({});
  const [generatedContent, setGeneratedContent] = useState<Record<string, any>>({});

  // Handle project type selection
  const handleProjectTypeSelect = (type: 'interior' | 'exterior') => {
    setProjectType(type);
    setIsTypeModalOpen(false);
    setCurrentStep(1); // Move to input step
  };

  // Handle information extraction from TranscriptInput
  const handleInformationExtracted = (data: Record<string, any>) => {
    console.log('EstimateGenerator - Information extracted:', data);
    
    if (data.fields && Array.isArray(data.fields)) {
      console.log('EstimateGenerator - Extracted fields:', data.fields.map(f => ({
        name: f.name,
        formField: f.formField,
        value: f.value
      })));
    }
    
    setExtractedData(data);
    
    if (data.transcript) {
      setTranscript(data.transcript);
    }
    if (data.summary) {
      setSummary(data.summary);
    }
    
    setCurrentStep(2); // Move to review step
  };

  // Handle missing info completion
  const handleMissingInfoComplete = (info: Record<string, any>) => {
    setMissingInfo(info);
    setCurrentStep(3); // Move to estimate review step
  };

  // Handle estimate completion - now moves to content generation
  const handleEstimateComplete = (fields: Record<string, any>, finalEstimate: Record<string, any>) => {
    console.log('EstimateGenerator - Estimate completed:', { fields, finalEstimate });
    setEstimateFields(fields);
    
    // Extract line items and totals from finalEstimate
    if (finalEstimate.lineItems) {
      setLineItems(finalEstimate.lineItems);
    }
    if (finalEstimate.totals) {
      setTotals(finalEstimate.totals);
    }
    
    setCurrentStep(4); // Move to content generation step
  };

  // Handle content generation completion
  const handleContentGenerated = (content: Record<string, any>) => {
    console.log('EstimateGenerator - Content generated:', content);
    setGeneratedContent(content);
    setCurrentStep(5); // Move to content editing step
  };

  // Handle content editing completion
  const handleContentEdited = (editedContent: Record<string, any>) => {
    setGeneratedContent(editedContent);
    setCurrentStep(6); // Move to PDF generation step
  };

  // Handle final PDF completion
  const handlePDFComplete = () => {
    // Save the complete estimate to localStorage
    const savedEstimates = JSON.parse(localStorage.getItem('estimates') || '[]');
    savedEstimates.push({
      id: Date.now().toString(),
      date: new Date().toISOString(),
      projectType,
      estimateFields,
      lineItems,
      totals,
      content: generatedContent
    });
    localStorage.setItem('estimates', JSON.stringify(savedEstimates));
    
    console.log('Complete estimate saved:', {
      projectType,
      estimateFields,
      lineItems,
      totals,
      content: generatedContent
    });
    
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
          <TranscriptInput 
            onInformationExtracted={handleInformationExtracted}
            onClose={() => {}}
          />
        );
      case 2:
        return (
          <SummaryChecker 
            summary={summary || 'Project information extracted from your input'} 
            transcript={transcript || 'Information extracted from your input'}
            extractedData={extractedData}
            onComplete={handleMissingInfoComplete} 
          />
        );
      case 3:
        return (
          <EstimateReview 
            transcript={transcript || 'Information extracted from your input'}
            summary={summary || 'Project information extracted from your input'}
            missingInfo={missingInfo}
            projectType={projectType}
            extractedData={extractedData}
            onComplete={handleEstimateComplete} 
          />
        );
      case 4:
        return (
          <EstimateContentGenerator
            estimateData={{ ...extractedData, ...missingInfo }}
            projectType={projectType}
            lineItems={lineItems}
            totals={totals}
            onComplete={handleContentGenerated}
          />
        );
      case 5:
        return (
          <div className="text-center p-8">
            <h3 className="text-lg font-medium mb-4">Content Editing</h3>
            <p className="text-muted-foreground mb-4">Content editing component coming next...</p>
            <Button onClick={() => handleContentEdited(generatedContent)}>
              Continue to PDF Generation
            </Button>
          </div>
        );
      case 6:
        return (
          <div className="text-center p-8">
            <h3 className="text-lg font-medium mb-4">PDF Generation</h3>
            <p className="text-muted-foreground mb-4">PDF generation component coming next...</p>
            <Button onClick={handlePDFComplete}>
              Complete Estimate
            </Button>
          </div>
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
              Record audio, upload files, or paste a transcript to generate an estimate
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
                  (currentStep === 1 && Object.keys(extractedData).length === 0) ||
                  (currentStep === 2 && Object.keys(missingInfo).length === 0) ||
                  (currentStep === 3 && Object.keys(estimateFields).length === 0) ||
                  (currentStep === 4 && Object.keys(generatedContent).length === 0)
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
