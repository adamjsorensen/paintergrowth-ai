
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Lightbulb } from 'lucide-react';
import { useSuggestions } from './suggestion-engine/useSuggestions';
import { UpsellsSection } from './suggestion-engine/UpsellsSection';
import { MissingScopeSection } from './suggestion-engine/MissingScopeSection';
import { RiskMitigationSection } from './suggestion-engine/RiskMitigationSection';
import { EstimateSuggestionEngineProps } from './suggestion-engine/types';

const EstimateSuggestionEngine: React.FC<EstimateSuggestionEngineProps> = ({
  estimateData,
  projectType,
  lineItems,
  totals,
  onComplete,
  onGoBackToRooms
}) => {
  const {
    suggestions,
    selectedSuggestions,
    isLoading,
    error,
    toggleSuggestion,
    addUpsell,
    updateUpsell,
    setSelectedSuggestions
  } = useSuggestions(estimateData, projectType, lineItems, totals);

  const handleContinue = () => {
    console.log('Continuing with selected suggestions:', selectedSuggestions);
    onComplete(selectedSuggestions);
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Analyzing Your Estimate
          </CardTitle>
          <CardDescription>
            Our AI is reviewing your project details to suggest improvements and additions...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Generating intelligent suggestions...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Suggestions & Add-ons
          </CardTitle>
          <CardDescription>
            Unable to generate suggestions at this time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">We encountered an issue generating suggestions.</p>
            <Button onClick={handleContinue} className="bg-blue-600 hover:bg-blue-700">
              Continue to Content Generation
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalUpsellValue = suggestions.upsellRecommendations
    .filter(s => selectedSuggestions.includes(s.id))
    .reduce((sum, s) => sum + s.estimatedPrice, 0);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Intelligent Suggestions & Analysis
        </CardTitle>
        <CardDescription>
          AI-generated recommendations to enhance your estimate based on project analysis.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Upsell Recommendations Section */}
        <UpsellsSection
          upsells={suggestions.upsellRecommendations}
          selectedSuggestions={selectedSuggestions}
          onToggleSuggestion={toggleSuggestion}
          onUpdateUpsell={updateUpsell}
          onAddUpsell={addUpsell}
        />

        {/* Missing Scope Section */}
        <MissingScopeSection
          missingScope={suggestions.missingScope}
          onGoBackToRooms={onGoBackToRooms}
        />

        {/* Risk Mitigation Section */}
        <RiskMitigationSection
          riskMitigation={suggestions.riskMitigation}
        />

        {/* Summary and Continue */}
        {selectedSuggestions.length > 0 && totalUpsellValue > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-blue-900">
                Total Additional Value: ${totalUpsellValue}
              </span>
              <span className="text-sm text-blue-700">
                {selectedSuggestions.length} suggestion{selectedSuggestions.length > 1 ? 's' : ''} selected
              </span>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={() => setSelectedSuggestions([])}>
            Clear All
          </Button>
          <Button onClick={handleContinue} className="bg-blue-600 hover:bg-blue-700">
            Continue with Analysis
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EstimateSuggestionEngine;
