
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Lightbulb, DollarSign, AlertTriangle, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EstimateSuggestionEngineProps {
  estimateData: Record<string, any>;
  projectType: 'interior' | 'exterior';
  lineItems: any[];
  totals: Record<string, any>;
  onComplete: (acceptedSuggestions: string[]) => void;
}

interface Suggestion {
  id: string;
  category: 'pricing' | 'upsell' | 'risk' | 'quality' | 'timeline';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  estimatedValue?: number;
}

const EstimateSuggestionEngine: React.FC<EstimateSuggestionEngineProps> = ({
  estimateData,
  projectType,
  lineItems,
  totals,
  onComplete
}) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    generateSuggestions();
  }, []);

  const generateSuggestions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const requestData = {
        estimateData,
        projectType,
        lineItems,
        totals,
        purpose: 'suggestion'
      };

      console.log('Generating suggestions with data:', requestData);

      const { data, error } = await supabase.functions.invoke('generate-estimate-content', {
        body: requestData
      });

      if (error) {
        throw new Error(error.message || 'Failed to generate suggestions');
      }

      if (data?.suggestions && Array.isArray(data.suggestions)) {
        setSuggestions(data.suggestions);
      } else {
        // Fallback suggestions if API doesn't return proper format
        setSuggestions([
          {
            id: 'prep-upgrade',
            category: 'quality',
            title: 'Premium Surface Preparation',
            description: 'Consider upgrading to premium prep work including detailed sanding and primer application for better paint adhesion and longevity.',
            impact: 'medium',
            estimatedValue: 350
          },
          {
            id: 'paint-quality',
            category: 'upsell',
            title: 'High-End Paint Selection',
            description: 'Upgrade to premium paint brands with superior coverage and durability, especially for high-traffic areas.',
            impact: 'high',
            estimatedValue: 200
          }
        ]);
      }
    } catch (err) {
      console.error('Error generating suggestions:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate suggestions');
      toast({
        title: "Error generating suggestions",
        description: "We'll continue with your estimate as-is.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSuggestion = (suggestionId: string) => {
    setSelectedSuggestions(prev => 
      prev.includes(suggestionId)
        ? prev.filter(id => id !== suggestionId)
        : [...prev, suggestionId]
    );
  };

  const handleContinue = () => {
    console.log('Continuing with selected suggestions:', selectedSuggestions);
    onComplete(selectedSuggestions);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'pricing': return <DollarSign className="h-4 w-4" />;
      case 'upsell': return <Plus className="h-4 w-4" />;
      case 'risk': return <AlertTriangle className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'pricing': return 'bg-green-100 text-green-800';
      case 'upsell': return 'bg-blue-100 text-blue-800';
      case 'risk': return 'bg-red-100 text-red-800';
      case 'quality': return 'bg-purple-100 text-purple-800';
      case 'timeline': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
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

  if (error || suggestions.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Suggestions & Add-ons
          </CardTitle>
          <CardDescription>
            {error ? 'Unable to generate suggestions at this time.' : 'No additional suggestions for this estimate.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              {error ? 'We encountered an issue generating suggestions.' : 'Your estimate looks comprehensive!'}
            </p>
            <Button onClick={handleContinue} className="bg-blue-600 hover:bg-blue-700">
              Continue to Content Generation
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalEstimatedValue = suggestions
    .filter(s => selectedSuggestions.includes(s.id) && s.estimatedValue)
    .reduce((sum, s) => sum + (s.estimatedValue || 0), 0);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Intelligent Suggestions & Add-ons
        </CardTitle>
        <CardDescription>
          Review AI-generated suggestions to enhance your estimate. Select any that apply to your project.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className={`border rounded-lg p-4 transition-all ${
              selectedSuggestions.includes(suggestion.id)
                ? 'border-blue-300 bg-blue-50'
                : getImpactColor(suggestion.impact)
            }`}
          >
            <div className="flex items-start gap-3">
              <Checkbox
                id={suggestion.id}
                checked={selectedSuggestions.includes(suggestion.id)}
                onCheckedChange={() => toggleSuggestion(suggestion.id)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={getCategoryColor(suggestion.category)}>
                    {getCategoryIcon(suggestion.category)}
                    <span className="ml-1 capitalize">{suggestion.category}</span>
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {suggestion.impact} Impact
                  </Badge>
                  {suggestion.estimatedValue && (
                    <Badge variant="secondary">
                      +${suggestion.estimatedValue}
                    </Badge>
                  )}
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  {suggestion.title}
                </h4>
                <p className="text-gray-600 text-sm">
                  {suggestion.description}
                </p>
              </div>
            </div>
          </div>
        ))}

        {selectedSuggestions.length > 0 && totalEstimatedValue > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-blue-900">
                Total Additional Value: ${totalEstimatedValue}
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
            Continue with {selectedSuggestions.length} Suggestion{selectedSuggestions.length !== 1 ? 's' : ''}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EstimateSuggestionEngine;
