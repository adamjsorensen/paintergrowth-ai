
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, AlertCircle, Mic, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface MobileReviewStepProps {
  summary: string;
  transcript: string;
  extractedData: Record<string, any>;
  onComplete: (info: Record<string, any>) => void;
}

const MobileReviewStep: React.FC<MobileReviewStepProps> = ({ 
  summary, 
  transcript, 
  extractedData, 
  onComplete 
}) => {
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [editingField, setEditingField] = useState<any>(null);
  const [editValue, setEditValue] = useState('');
  const [localExtractedData, setLocalExtractedData] = useState(extractedData);

  const hasData = Object.keys(localExtractedData).length > 0;
  
  const getFieldStatus = (field: any) => {
    if (!field || !field.value || field.value === '') {
      return { icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50', text: 'Missing' };
    }
    return { icon: Check, color: 'text-green-500', bg: 'bg-green-50', text: 'Complete' };
  };

  const handleFieldEdit = (field: any) => {
    setEditingField(field);
    setEditValue(Array.isArray(field.value) ? field.value.join(', ') : field.value || '');
    setIsEditSheetOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingField) {
      const updatedData = { ...localExtractedData };
      if (updatedData.fields && Array.isArray(updatedData.fields)) {
        const fieldIndex = updatedData.fields.findIndex(f => f.name === editingField.name);
        if (fieldIndex !== -1) {
          updatedData.fields[fieldIndex] = {
            ...editingField,
            value: editValue
          };
        }
      }
      setLocalExtractedData(updatedData);
      setIsEditSheetOpen(false);
      setEditingField(null);
    }
  };

  const getInputType = (fieldName: string) => {
    const name = fieldName.toLowerCase();
    if (name.includes('email')) return 'email';
    if (name.includes('phone') || name.includes('tel')) return 'tel';
    if (name.includes('date')) return 'date';
    if (name.includes('address') || name.includes('description') || name.includes('notes')) return 'textarea';
    return 'text';
  };

  const handleContinue = () => {
    onComplete(localExtractedData);
  };

  if (!hasData) {
    return (
      <div className="px-4 py-6 text-center">
        <div className="mb-6">
          <Mic className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Information Extracted</h3>
          <p className="text-gray-600">Go back to record audio or provide project details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Review Project Details</h2>
        <p className="text-gray-600 text-sm">Tap any field to edit</p>
      </div>

      {/* Project Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            Project Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
        </CardContent>
      </Card>

      {/* Extracted Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Project Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {localExtractedData.fields && Array.isArray(localExtractedData.fields) ? (
            localExtractedData.fields.map((field: any, index: number) => {
              const status = getFieldStatus(field);
              const StatusIcon = status.icon;
              
              return (
                <button
                  key={index}
                  onClick={() => handleFieldEdit(field)}
                  className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors min-h-[48px] text-left"
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900 flex items-center gap-2">
                      {field.name}
                      <Edit2 className="h-3 w-3 text-gray-400" />
                    </div>
                    {field.value && (
                      <div className="text-sm text-gray-600 mt-1">
                        {Array.isArray(field.value) ? field.value.join(', ') : field.value}
                      </div>
                    )}
                  </div>
                  <Badge variant="outline" className={`ml-3 ${status.bg} ${status.color} border-0 min-h-[32px] px-3`}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {status.text}
                  </Badge>
                </button>
              );
            })
          ) : (
            <div className="text-center py-4 text-gray-500">
              No specific fields extracted
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Sheet */}
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent side="bottom" className="h-[70vh]">
          <SheetHeader>
            <SheetTitle>Edit {editingField?.name}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 mt-6">
            <div>
              <Label htmlFor="edit-field" className="text-sm font-medium">
                {editingField?.name}
              </Label>
              {getInputType(editingField?.name || '') === 'textarea' ? (
                <Textarea
                  id="edit-field"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="mt-2 min-h-[100px]"
                  placeholder={`Enter ${editingField?.name?.toLowerCase()}`}
                />
              ) : (
                <Input
                  id="edit-field"
                  type={getInputType(editingField?.name || '')}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="mt-2"
                  placeholder={`Enter ${editingField?.name?.toLowerCase()}`}
                />
              )}
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsEditSheetOpen(false)}
                className="flex-1 min-h-[56px]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                className="flex-1 min-h-[56px]"
              >
                Save
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Continue Button */}
      <div className="pt-4">
        <Button 
          onClick={handleContinue}
          className="w-full min-h-[56px] text-lg font-medium"
          size="lg"
        >
          Continue to Pricing
        </Button>
      </div>
    </div>
  );
};

export default MobileReviewStep;
