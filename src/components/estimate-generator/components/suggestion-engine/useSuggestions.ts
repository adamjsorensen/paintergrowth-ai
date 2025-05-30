
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SuggestionResponse, UpsellRecommendation } from './types';

export const useSuggestions = (
  estimateData: Record<string, any>,
  projectType: 'interior' | 'exterior',
  lineItems: any[],
  totals: Record<string, any>
) => {
  const [suggestions, setSuggestions] = useState<SuggestionResponse>({
    upsellRecommendations: [],
    missingScope: [],
    riskMitigation: []
  });
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const generateSuggestions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const enhancedEstimateData = {
        ...estimateData,
        projectType,
        hasRooms: lineItems.length > 0,
        totalValue: totals.grandTotal || totals.total || 0,
        lineItemCount: lineItems.length,
        averageRoomSize: lineItems.length > 0 ? 'medium' : 'unknown'
      };

      const requestData = {
        estimateData: enhancedEstimateData,
        projectType,
        lineItems,
        totals,
        roomsMatrix: estimateData.roomsMatrix || [],
        clientNotes: estimateData.clientNotes || '',
        purpose: 'suggestion'
      };

      console.log('Generating suggestions with enhanced data:', requestData);

      const { data, error } = await supabase.functions.invoke('generate-estimate-content', {
        body: requestData
      });

      if (error) {
        throw new Error(error.message || 'Failed to generate suggestions');
      }

      if (data && typeof data === 'object') {
        setSuggestions({
          upsellRecommendations: data.upsellRecommendations || [],
          missingScope: data.missingScope || [],
          riskMitigation: data.riskMitigation || []
        });
      } else {
        setSuggestions({
          upsellRecommendations: [],
          missingScope: [],
          riskMitigation: []
        });
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

  useEffect(() => {
    generateSuggestions();
  }, []);

  const toggleSuggestion = (suggestionId: string) => {
    setSelectedSuggestions(prev => 
      prev.includes(suggestionId)
        ? prev.filter(id => id !== suggestionId)
        : [...prev, suggestionId]
    );
  };

  const addUpsell = (upsell: UpsellRecommendation) => {
    setSuggestions(prev => ({
      ...prev,
      upsellRecommendations: [...prev.upsellRecommendations, upsell]
    }));
    
    // Auto-select the new upsell
    setSelectedSuggestions(prev => [...prev, upsell.id]);
  };

  const updateUpsell = (upsellId: string, updatedUpsell: Partial<UpsellRecommendation>) => {
    setSuggestions(prev => ({
      ...prev,
      upsellRecommendations: prev.upsellRecommendations.map(item =>
        item.id === upsellId ? { ...item, ...updatedUpsell } as UpsellRecommendation : item
      )
    }));
  };

  return {
    suggestions,
    selectedSuggestions,
    isLoading,
    error,
    toggleSuggestion,
    addUpsell,
    updateUpsell,
    setSelectedSuggestions
  };
};
