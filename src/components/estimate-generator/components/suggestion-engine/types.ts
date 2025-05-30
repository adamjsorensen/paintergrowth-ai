
export interface UpsellRecommendation {
  id: string;
  title: string;
  description: string;
  estimatedPrice: number;
  reasoning: string;
}

export interface MissingScopeItem {
  id: string;
  item: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
}

export interface RiskMitigationItem {
  id: string;
  risk: string;
  description: string;
  solution: string;
  impact: 'low' | 'medium' | 'high';
}

export interface SuggestionResponse {
  upsellRecommendations: UpsellRecommendation[];
  missingScope: MissingScopeItem[];
  riskMitigation: RiskMitigationItem[];
}

export interface EstimateSuggestionEngineProps {
  estimateData: Record<string, any>;
  projectType: 'interior' | 'exterior';
  lineItems: any[];
  totals: Record<string, any>;
  onComplete: (acceptedSuggestions: string[]) => void;
  onGoBackToRooms?: () => void;
}
