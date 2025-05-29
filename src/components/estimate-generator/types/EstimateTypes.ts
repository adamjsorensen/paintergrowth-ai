
export interface EstimateStep {
  id: number;
  label: string;
}

export interface EstimateState {
  currentStep: number;
  projectType: 'interior' | 'exterior';
  extractedData: Record<string, any>;
  transcript: string;
  summary: string;
  missingInfo: Record<string, any>;
  estimateFields: Record<string, any>;
  lineItems: any[];
  totals: Record<string, any>;
  suggestions: Record<string, any>;
  acceptedSuggestions: string[];
  generatedContent: Record<string, any>;
  editedContent: Record<string, any>;
}

export interface EstimateHandlers {
  handleProjectTypeSelect: (type: 'interior' | 'exterior') => void;
  handleInformationExtracted: (data: Record<string, any>) => void;
  handleMissingInfoComplete: (info: Record<string, any>) => void;
  handleEstimateComplete: (fields: Record<string, any>, finalEstimate: Record<string, any>) => void;
  handleSuggestionsComplete: (acceptedSuggestions: string[]) => void;
  handleContentGenerated: (content: Record<string, any>) => void;
  handleContentEdited: (editedContent: Record<string, any>) => void;
  handlePDFComplete: () => void;
  handleBackToContentGeneration: () => void;
  handleBackToContentEditor: () => void;
}
