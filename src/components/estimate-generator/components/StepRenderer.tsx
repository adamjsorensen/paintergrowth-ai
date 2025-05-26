
import React from 'react';
import ModalProjectType from '@/components/estimate-generator/ModalProjectType';
import TranscriptInput from '@/components/audio-transcript/TranscriptInput';
import SummaryChecker from '@/components/estimate-generator/SummaryChecker';
import EstimateReview from '@/components/estimate-generator/EstimateReview';
import EstimateContentGenerator from '@/components/estimate-generator/EstimateContentGenerator';
import EstimateContentEditor from '@/components/estimate-generator/EstimateContentEditor';
import EstimatePDFGenerator from '@/components/estimate-generator/EstimatePDFGenerator';
import { EstimateState, EstimateHandlers } from '../types/EstimateTypes';

interface StepRendererProps {
  state: EstimateState;
  handlers: EstimateHandlers;
}

const StepRenderer: React.FC<StepRendererProps> = ({ state, handlers }) => {
  const {
    currentStep,
    projectType,
    isTypeModalOpen,
    extractedData,
    transcript,
    summary,
    missingInfo,
    lineItems,
    totals,
    generatedContent,
    editedContent
  } = state;

  const {
    handleProjectTypeSelect,
    handleInformationExtracted,
    handleMissingInfoComplete,
    handleEstimateComplete,
    handleContentGenerated,
    handleContentEdited,
    handlePDFComplete,
    handleBackToContentGeneration,
    handleBackToContentEditor
  } = handlers;

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
        <EstimateContentEditor
          content={generatedContent}
          onComplete={handleContentEdited}
          onBack={handleBackToContentGeneration}
        />
      );
    case 6:
      return (
        <EstimatePDFGenerator
          estimateData={{ ...extractedData, ...missingInfo }}
          projectType={projectType}
          lineItems={lineItems}
          totals={totals}
          content={editedContent}
          onComplete={handlePDFComplete}
          onBack={handleBackToContentEditor}
        />
      );
    default:
      return null;
  }
};

export default StepRenderer;
