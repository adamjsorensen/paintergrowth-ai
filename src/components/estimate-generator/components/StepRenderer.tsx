import React from 'react';
import { EstimateState, EstimateHandlers } from '../types/EstimateTypes';
import { ESTIMATE_STEPS } from '../constants/EstimateSteps';
import InlineProjectTypeSelector from './InlineProjectTypeSelector';
import Transcriber from '../Transcriber';
import SummaryChecker from '../SummaryChecker';
import EstimateReview from '../EstimateReview';
import EstimateSuggestionEngine from './EstimateSuggestionEngine';
import EstimateContentGenerator from '../EstimateContentGenerator';
import EstimateContentEditor from '../EstimateContentEditor';
import PDFGeneratorV2 from '../PDFGeneratorV2';
import MobileProjectTypeSelector from './MobileProjectTypeSelector';
import MobileReviewStep from './MobileReviewStep';
import { useIsMobile } from '@/hooks/use-mobile';

interface StepRendererProps {
  state: EstimateState;
  handlers: EstimateHandlers;
  onGoBackToRooms?: () => void;
  onStartOver?: () => void;
}

const StepRenderer: React.FC<StepRendererProps> = ({ 
  state, 
  handlers, 
  onGoBackToRooms,
  onStartOver 
}) => {
  const isMobile = useIsMobile();
  
  switch (state.currentStep) {
    case 0:
      return isMobile ? (
        <MobileProjectTypeSelector
          onProjectTypeSelect={handlers.handleProjectTypeSelect}
        />
      ) : (
        <InlineProjectTypeSelector
          onProjectTypeSelect={handlers.handleProjectTypeSelect}
        />
      );
    
    case 1:
      return (
        <Transcriber
          projectType={state.projectType}
          onInformationExtracted={handlers.handleInformationExtracted}
        />
      );
    
    case 2:
      return isMobile ? (
        <MobileReviewStep
          summary={state.summary}
          transcript={state.transcript}
          extractedData={state.extractedData}
          missingInfo={state.missingInfo}
          projectType={state.projectType}
          onComplete={handlers.handleMissingInfoComplete}
          onStartOver={onStartOver}
        />
      ) : (
        <SummaryChecker
          summary={state.summary}
          transcript={state.transcript}
          extractedData={state.extractedData}
          missingInfo={state.missingInfo}
          projectType={state.projectType}
          onComplete={handlers.handleMissingInfoComplete}
        />
      );
    
    case 3:
      return (
        <EstimateReview
          transcript={state.transcript}
          summary={state.summary}
          missingInfo={state.missingInfo}
          projectType={state.projectType}
          extractedData={state.extractedData}
          onComplete={handlers.handleEstimateComplete}
        />
      );
    
    case 4:
      return (
        <EstimateSuggestionEngine
          transcript={state.transcript}
          projectType={state.projectType}
          onComplete={handlers.handleSuggestionsComplete}
          onGoBackToRooms={onGoBackToRooms}
        />
      );
    
    case 5:
      return (
        <EstimateContentGenerator
          projectType={state.projectType}
          acceptedSuggestions={state.acceptedSuggestions}
          estimateFields={state.estimateFields}
          onContentGenerated={handlers.handleContentGenerated}
        />
      );
    
    case 6:
      return (
        <EstimateContentEditor
          projectType={state.projectType}
          generatedContent={state.generatedContent}
          onContentEdited={handlers.handleContentEdited}
          onBackToContentGeneration={handlers.handleBackToContentGeneration}
        />
      );
    
    case 7:
      return (
        <PDFGeneratorV2
          estimateData={state.estimateFields || {}}
          projectType={state.projectType}
          lineItems={state.lineItems}
          totals={state.totals}
          estimateFields={Array.isArray(state.estimateFields) ? state.estimateFields : Object.entries(state.estimateFields || {}).map(([key, value]) => ({ formField: key, value }))}
          onComplete={handlers.handlePDFComplete}
        />
      );
    
    default:
      return <div>Step not found</div>;
  }
};

export default StepRenderer;
