
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DollarSign, Edit2, Check, X, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UpsellRecommendation } from './types';

interface UpsellsSectionProps {
  upsells: UpsellRecommendation[];
  selectedSuggestions: string[];
  onToggleSuggestion: (id: string) => void;
  onUpdateUpsell: (id: string, updatedUpsell: Partial<UpsellRecommendation>) => void;
  onAddUpsell: (upsell: UpsellRecommendation) => void;
}

export const UpsellsSection: React.FC<UpsellsSectionProps> = ({
  upsells,
  selectedSuggestions,
  onToggleSuggestion,
  onUpdateUpsell,
  onAddUpsell
}) => {
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

  const startEditing = (upsell: UpsellRecommendation) => {
    setEditingId(upsell.id);
    setEditForm({ ...upsell });
  };

  const saveEdit = () => {
    if (!editingId || !editForm.title || !editForm.description || !editForm.estimatedPrice) return;
    
    onUpdateUpsell(editingId, editForm);
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
    
    onAddUpsell(newUpsell);
    
    setCustomUpsell({ title: '', description: '', estimatedPrice: 0, reasoning: '' });
    setShowCustomUpsell(false);
    
    toast({
      title: "Custom upsell added",
      description: "Your custom upsell has been added to the recommendations.",
    });
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="h-5 w-5 text-green-600" />
        <h3 className="text-lg font-semibold text-gray-900">Upsell Opportunities</h3>
        <Badge variant="secondary">{upsells.length}</Badge>
      </div>
      
      <div className="space-y-3">
        {upsells.map((upsell) => (
          <div key={upsell.id} className={`border rounded-lg p-4 transition-all ${
            selectedSuggestions.includes(upsell.id) ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
          }`}>
            <div className="flex items-start gap-3">
              <Checkbox
                id={upsell.id}
                checked={selectedSuggestions.includes(upsell.id)}
                onCheckedChange={() => onToggleSuggestion(upsell.id)}
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
  );
};
