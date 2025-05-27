
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import EditFieldSheet from './mobile-review/EditFieldSheet';
import ProjectSummaryCard from './mobile-review/ProjectSummaryCard';
import ProjectInformationCard from './mobile-review/ProjectInformationCard';
import EmptyReviewState from './mobile-review/EmptyReviewState';

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

  const handleContinue = () => {
    onComplete(localExtractedData);
  };

  if (!hasData) {
    return <EmptyReviewState />;
  }

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Review Project Details</h2>
        <p className="text-gray-600 text-sm">Tap any field to edit</p>
      </div>

      <ProjectSummaryCard summary={summary} />

      <ProjectInformationCard 
        extractedData={localExtractedData}
        onFieldEdit={handleFieldEdit}
      />

      <EditFieldSheet
        isOpen={isEditSheetOpen}
        onOpenChange={setIsEditSheetOpen}
        editingField={editingField}
        editValue={editValue}
        onEditValueChange={setEditValue}
        onSave={handleSaveEdit}
      />

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
