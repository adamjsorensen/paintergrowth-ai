
export interface EstimateStep {
  id: string;
  label: string;
}

export interface EstimateState {
  currentStep: number;
  projectType: 'interior' | 'exterior';
  isTypeModalOpen: boolean;
  extractedData: Record<string, any>;
  transcript: string;
  summary: string;
  missingInfo: Record<string, any>;
  estimateFields: Record<string, any>;
  lineItems: any[];
  totals: Record<string, any>;
  generatedContent: Record<string, any>;
  editedContent: Record<string, any>;
}

export interface EstimateHandlers {
  handleProjectTypeSelect: (type: 'interior' | 'exterior') => void;
  handleInformationExtracted: (data: Record<string, any>) => void;
  handleMissingInfoComplete: (info: Record<string, any>) => void;
  handleEstimateComplete: (fields: Record<string, any>, finalEstimate: Record<string, any>) => void;
  handleContentGenerated: (content: Record<string, any>) => void;
  handleContentEdited: (editedContent: Record<string, any>) => void;
  handlePDFComplete: () => void;
  handleBackToContentGeneration: () => void;
  handleBackToContentEditor: () => void;
}
