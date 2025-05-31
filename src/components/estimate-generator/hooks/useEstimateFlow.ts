
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { EstimateState, EstimateHandlers } from '../types/EstimateTypes';
import { useIsMobile } from '@/hooks/use-mobile';

const STORAGE_KEY = 'estimate-workflow-state';
const STATE_VERSION = 1;

interface PersistedState extends EstimateState {
  version: number;
  timestamp: number;
}

const getInitialState = (): EstimateState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsedState: PersistedState = JSON.parse(saved);
      
      // Check version compatibility
      if (parsedState.version === STATE_VERSION) {
        // Remove persistence metadata and return workflow state
        const { version, timestamp, ...workflowState } = parsedState;
        console.log('Restored estimate workflow state from localStorage');
        return workflowState;
      } else {
        console.log('Clearing incompatible saved state');
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  } catch (error) {
    console.error('Failed to restore estimate state:', error);
    localStorage.removeItem(STORAGE_KEY);
  }

  // Return default initial state
  return {
    currentStep: 0,
    projectType: 'interior',
    extractedData: {},
    transcript: '',
    summary: '',
    missingInfo: {},
    estimateFields: {},
    lineItems: [],
    totals: {},
    suggestions: {},
    acceptedSuggestions: [],
    generatedContent: {},
    editedContent: {}
  };
};

const saveStateToStorage = (state: EstimateState) => {
  try {
    const persistedState: PersistedState = {
      ...state,
      version: STATE_VERSION,
      timestamp: Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedState));
  } catch (error) {
    console.error('Failed to save estimate state:', error);
  }
};

const clearSavedState = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('Cleared saved estimate workflow state');
  } catch (error) {
    console.error('Failed to clear saved state:', error);
  }
};

export const useEstimateFlow = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Use lazy initialization to avoid race conditions
  const [state, setState] = useState<EstimateState>(() => getInitialState());
  
  // Add ref to track if mobile protection effect has run
  const mobileEffectHasRun = useRef(false);

  // Mobile step 3 protection - automatically redirect to step 4
  useEffect(() => {
    // Skip on first render to prevent initial redirect
    if (!mobileEffectHasRun.current) {
      mobileEffectHasRun.current = true;
      return;
    }

    if (isMobile && state.currentStep === 3) {
      console.log('Mobile user detected on step 3, redirecting to step 4');
      setState(prev => ({ ...prev, currentStep: 4 }));
    }
  }, [isMobile, state.currentStep]);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    saveStateToStorage(state);
  }, [state]);

  const handlers: EstimateHandlers = {
    handleProjectTypeSelect: (type: 'interior' | 'exterior') => {
      setState(prev => ({
        ...prev,
        projectType: type,
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

    handleSuggestionsComplete: (acceptedSuggestions: string[]) => {
      console.log('EstimateGenerator - Suggestions completed:', acceptedSuggestions);
      setState(prev => ({
        ...prev,
        acceptedSuggestions,
        currentStep: 5
      }));
    },

    handleContentGenerated: (content: Record<string, any>) => {
      console.log('EstimateGenerator - Content generated:', content);
      setState(prev => ({
        ...prev,
        generatedContent: content,
        editedContent: content,
        currentStep: 6
      }));
    },

    handleContentEdited: (editedContent: Record<string, any>) => {
      console.log('EstimateGenerator - Content edited:', editedContent);
      setState(prev => ({
        ...prev,
        editedContent,
        currentStep: 7
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
        suggestions: state.suggestions,
        acceptedSuggestions: state.acceptedSuggestions,
        generatedContent: state.generatedContent,
        editedContent: state.editedContent
      };
      
      savedEstimates.push(completeEstimate);
      localStorage.setItem('estimates', JSON.stringify(savedEstimates));
      
      console.log('Complete estimate saved:', completeEstimate);
      
      // Clear the workflow state since we're done
      clearSavedState();
      
      navigate('/dashboard');
    },

    handleBackToContentGeneration: () => {
      setState(prev => ({ ...prev, currentStep: 5 }));
    },

    handleBackToContentEditor: () => {
      setState(prev => ({ ...prev, currentStep: 6 }));
    }
  };

  const setCurrentStep = (step: number) => {
    // Prevent mobile users from going to step 3
    if (isMobile && step === 3) {
      console.log('Preventing mobile navigation to step 3, redirecting to step 4');
      setState(prev => ({ ...prev, currentStep: 4 }));
      return;
    }
    
    setState(prev => ({ ...prev, currentStep: step }));
  };

  // Add restart functionality to clear saved state and start over
  const restartWorkflow = () => {
    clearSavedState();
    setState({
      currentStep: 0,
      projectType: 'interior',
      extractedData: {},
      transcript: '',
      summary: '',
      missingInfo: {},
      estimateFields: {},
      lineItems: [],
      totals: {},
      suggestions: {},
      acceptedSuggestions: [],
      generatedContent: {},
      editedContent: {}
    });
  };

  return {
    state,
    handlers,
    setCurrentStep,
    restartWorkflow
  };
};
