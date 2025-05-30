import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Lightbulb, DollarSign, AlertTriangle, Plus, Edit2, Check, X, Target, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EstimateSuggestionEngineProps {
  estimateData: Record<string, any>;
  projectType: 'interior' | 'exterior';
  lineItems: any[];
  totals: Record<string, any>;
  onComplete: (acceptedSuggestions: string[]) => void;
  onGoBackToRooms?: () => void;
}

interface UpsellRecommendation {
  id: string;
  title: string;
  description: string;
  estimatedPrice: number;
  reasoning: string;
}

interface MissingScopeItem {
  id: string;
  item: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
}

interface RiskMitigationItem {
  id: string;
  risk: string;
  description: string;
  solution: string;
  impact: 'low' | 'medium' | 'high';
}

interface SuggestionResponse {
  upsellRecommendations: UpsellRecommendation[];
  missingScope: MissingScopeItem[];
  riskMitigation: RiskMitigationItem[];
}

const EstimateSuggestionEngine: React.FC<EstimateSuggestionEngineProps> = ({
  estimateData,
  projectType,
  lineItems,
  totals,
  onComplete,
  onGoBackToRooms
}) => {
  const [suggestions, setSuggestions] = useState<SuggestionResponse>({
    upsellRecommendations: [],
    missingScope: [],
    riskMitigation: []
  });
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<UpsellRecommendation>>({});
  const [showCustomUpsell, setShowCustomUpsell] = useState(false);
  const [customUpsell, setCustomUpsell] = useState<Partial<UpsellRecommendation>>({
    title: '',
    description: '',
    estimatedPrice: 0,
    reasoning: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    generateSuggestions();
  }, []);

  const generateSuggestions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Enhanced data context for better suggestions
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

  const toggleSuggestion = (suggestionId: string) => {
    setSelectedSuggestions(prev => 
      prev.includes(suggestionId)
        ? prev.filter(id => id !== suggestionId)
        : [...prev, suggestionId]
    );
  };

  const startEditing = (upsell: UpsellRecommendation) => {
    setEditingId(upsell.id);
    setEditForm({ ...upsell });
  };

  const saveEdit = () => {
    if (!editingId || !editForm.title || !editForm.description || !editForm.estimatedPrice) return;
    
    setSuggestions(prev => ({
      ...prev,
      upsellRecommendations: prev.upsellRecommendations.map(item =>
        item.id === editingId ? { ...item, ...editForm } as UpsellRecommendation : item
      )
    }));
    
    setEditingId(null);
    setEditForm({});
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const addCustomUpsell = () => {
    if (!customUpsell.title || !customUpsell.description || !customUpsell.estimatedPrice) return;
    
    const newUpsell: UpsellRecommendation = {
      id: `custom-${Date.now()}`,
      title: customUpsell.title,
      description: customUpsell.description,
      estimatedPrice: customUpsell.estimatedPrice,
      reasoning: customUpsell.reasoning || 'Custom upsell opportunity'
    };
    
    setSuggestions(prev => ({
      ...prev,
      upsellRecommendations: [...prev.upsellRecommendations, newUpsell]
    }));
    
    // Auto-select the new upsell
    setSelectedSuggestions(prev => [...prev, newUpsell.id]);
    
    setCustomUpsell({ title: '', description: '', estimatedPrice: 0, reasoning: '' });
    setShowCustomUpsell(false);
    
    toast({
      title: "Custom upsell added",
      description: "Your custom upsell has been added to the recommendations.",
    });
  };

  const handleContinue = () => {
    console.log('Continuing with selected suggestions:', selectedSuggestions);
    onComplete(selectedSuggestions);
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
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
        <div>
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Upsell Opportunities</h3>
            <Badge variant="secondary">{suggestions.upsellRecommendations.length}</Badge>
          </div>
          
          <div className="space-y-3">
            {suggestions.upsellRecommendations.map((upsell) => (
              <div key={upsell.id} className={`border rounded-lg p-4 transition-all ${
                selectedSuggestions.includes(upsell.id) ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
              }`}>
                <div className="flex items-start gap-3">
                  <Checkbox
                    id={upsell.id}
                    checked={selectedSuggestions.includes(upsell.id)}
                    onCheckedChange={() => toggleSuggestion(upsell.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    {editingId === upsell.id ? (
                      <div className="space-y-3">
                        <Input
                          value={editForm.title || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Service title"
                        />
                        <Textarea
                          value={editForm.description || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Service description"
                          rows={2}
                        />
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Price: $</span>
                          <Input
                            type="number"
                            value={editForm.estimatedPrice || 0}
                            onChange={(e) => setEditForm(prev => ({ ...prev, estimatedPrice: parseInt(e.target.value) || 0 }))}
                            className="w-24"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={saveEdit}>
                            <Check className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEdit}>
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{upsell.title}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-green-600">
                              +${upsell.estimatedPrice}
                            </Badge>
                            <Button size="sm" variant="ghost" onClick={() => startEditing(upsell)}>
                              <Edit2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{upsell.description}</p>
                        <p className="text-xs text-gray-500 italic">{upsell.reasoning}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {showCustomUpsell ? (
              <div className="border rounded-lg p-4 border-blue-200 bg-blue-50">
                <div className="space-y-3">
                  <Input
                    value={customUpsell.title || ''}
                    onChange={(e) => setCustomUpsell(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Custom service title"
                  />
                  <Textarea
                    value={customUpsell.description || ''}
                    onChange={(e) => setCustomUpsell(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Service description"
                    rows={2}
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Price: $</span>
                    <Input
                      type="number"
                      value={customUpsell.estimatedPrice || 0}
                      onChange={(e) => setCustomUpsell(prev => ({ ...prev, estimatedPrice: parseInt(e.target.value) || 0 }))}
                      className="w-24"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={addCustomUpsell}>
                      <Check className="h-4 w-4 mr-1" />
                      Add Upsell
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setShowCustomUpsell(false)}>
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <Button 
                variant="outline" 
                onClick={() => setShowCustomUpsell(true)}
                className="w-full border-dashed"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Custom Upsell
              </Button>
            )}
          </div>
        </div>

        {/* Missing Scope Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Missing Scope Items</h3>
            <Badge variant="secondary">{suggestions.missingScope.length}</Badge>
          </div>
          
          {suggestions.missingScope.length > 0 ? (
            <div className="space-y-3">
              {suggestions.missingScope.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 border-orange-200 bg-orange-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{item.item}</h4>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Badge className={getImpactColor(item.impact)}>
                        {item.impact} impact
                      </Badge>
                      {onGoBackToRooms && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={onGoBackToRooms}
                          className="flex items-center gap-1"
                        >
                          <Edit2 className="h-3 w-3" />
                          Go Back and Edit
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm italic">No missing scope items identified.</p>
          )}
        </div>

        {/* Risk Mitigation Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">Risk Mitigation</h3>
            <Badge variant="secondary">{suggestions.riskMitigation.length}</Badge>
          </div>
          
          {suggestions.riskMitigation.length > 0 ? (
            <div className="space-y-3">
              {suggestions.riskMitigation.map((risk) => (
                <div key={risk.id} className="border rounded-lg p-4 border-red-200 bg-red-50">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{risk.risk}</h4>
                    <Badge className={getImpactColor(risk.impact)}>
                      {risk.impact} impact
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{risk.description}</p>
                  <div className="bg-white rounded p-2 border border-red-100">
                    <p className="text-sm"><strong>Solution:</strong> {risk.solution}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm italic">No specific risks identified for this project.</p>
          )}
        </div>

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
