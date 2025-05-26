
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EstimateState, EstimateHandlers } from '../types/EstimateTypes';

export const useEstimateFlow = () => {
  const navigate = useNavigate();
  
  const [state, setState] = useState<EstimateState>({
    currentStep: 0,
    projectType: 'interior',
    isTypeModalOpen: true,
    extractedData: {},
    transcript: '',
    summary: '',
    missingInfo: {},
    estimateFields: {},
    lineItems: [],
    totals: {},
    generatedContent: {},
    editedContent: {}
  });

  const handlers: EstimateHandlers = {
    handleProjectTypeSelect: (type: 'interior' | 'exterior') => {
      setState(prev => ({
        ...prev,
        projectType: type,
        isTypeModalOpen: false,
        currentStep: 1
      }));
    },

    handleInformationExtracted: (data: Record<string, any>) => {
      console.log('EstimateGenerator - Information extracted:', data);
      
      if (data.fields && Array.isArray(data.fields)) {
        console.log('EstimateGenerator - Extracted fields:', data.fields.map(f => ({
          name: f.name,
          formField: f.formField,
          value: f.value
        })));
      }
      
      setState(prev => ({
        ...prev,
        extractedData: data,
        transcript: data.transcript || prev.transcript,
        summary: data.summary || prev.summary,
        currentStep: 2
      }));
    },

    handleMissingInfoComplete: (info: Record<string, any>) => {
      setState(prev => ({
        ...prev,
        missingInfo: info,
        currentStep: 3
      }));
    },

    handleEstimateComplete: (fields: Record<string, any>, finalEstimate: Record<string, any>) => {
      console.log('EstimateGenerator - Estimate completed:', { fields, finalEstimate });
      setState(prev => ({
        ...prev,
        estimateFields: fields,
        lineItems: finalEstimate.lineItems || prev.lineItems,
        totals: finalEstimate.totals || prev.totals,
        currentStep: 4
      }));
    },

    handleContentGenerated: (content: Record<string, any>) => {
      console.log('EstimateGenerator - Content generated:', content);
      setState(prev => ({
        ...prev,
        generatedContent: content,
        editedContent: content,
        currentStep: 5
      }));
    },

    handleContentEdited: (editedContent: Record<string, any>) => {
      console.log('EstimateGenerator - Content edited:', editedContent);
      setState(prev => ({
        ...prev,
        editedContent,
        currentStep: 6
      }));
    },

    handlePDFComplete: () => {
      const savedEstimates = JSON.parse(localStorage.getItem('estimates') || '[]');
      const completeEstimate = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        projectType: state.projectType,
        extractedData: state.extractedData,
        missingInfo: state.missingInfo,
        estimateFields: state.estimateFields,
        lineItems: state.lineItems,
        totals: state.totals,
        generatedContent: state.generatedContent,
        editedContent: state.editedContent
      };
      
      savedEstimates.push(completeEstimate);
      localStorage.setItem('estimates', JSON.stringify(savedEstimates));
      
      console.log('Complete estimate saved:', completeEstimate);
      navigate('/dashboard');
    },

    handleBackToContentGeneration: () => {
      setState(prev => ({ ...prev, currentStep: 4 }));
    },

    handleBackToContentEditor: () => {
      setState(prev => ({ ...prev, currentStep: 5 }));
    }
  };

  const setCurrentStep = (step: number) => {
    setState(prev => ({ ...prev, currentStep: step }));
  };

  return {
    state,
    handlers,
    setCurrentStep
  };
};
