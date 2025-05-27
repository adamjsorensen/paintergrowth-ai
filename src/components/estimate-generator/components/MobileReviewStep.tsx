
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import EditFieldSheet from './mobile-review/EditFieldSheet';
import ProjectSummaryCard from './mobile-review/ProjectSummaryCard';
import ProjectInformationCard from './mobile-review/ProjectInformationCard';
import ProjectSettingsSection from './mobile-review/ProjectSettingsSection';
import EmptyReviewState from './mobile-review/EmptyReviewState';

interface ProjectMetadata {
  trimColor: string;
  wallColors: number;
  coats: 'one' | 'two';
  paintType: string;
  specialConsiderations: string;
  salesNotes: string;
  productionDate: Date | undefined;
  discountPercent: number;
}

interface MobileReviewStepProps {
  summary: string;
  transcript: string;
  extractedData: Record<string, any>;
  projectMetadata?: ProjectMetadata;
  onComplete: (info: Record<string, any>) => void;
  onProjectMetadataChange?: (metadata: ProjectMetadata) => void;
}

const MobileReviewStep: React.FC<MobileReviewStepProps> = ({ 
  summary, 
  transcript, 
  extractedData,
  projectMetadata,
  onComplete,
  onProjectMetadataChange
}) => {
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [editingField, setEditingField] = useState<any>(null);
  const [editValue, setEditValue] = useState('');
  const [localExtractedData, setLocalExtractedData] = useState(extractedData);

  // Initialize project metadata with defaults if not provided
  const [localProjectMetadata, setLocalProjectMetadata] = useState<ProjectMetadata>(
    projectMetadata || {
      trimColor: '',
      wallColors: 1,
      coats: 'two',
      paintType: 'Premium Interior Paint',
      specialConsiderations: '',
      salesNotes: '',
      productionDate: undefined,
      discountPercent: 0
    }
  );

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

  const handleProjectMetadataChange = (metadata: ProjectMetadata) => {
    setLocalProjectMetadata(metadata);
    if (onProjectMetadataChange) {
      onProjectMetadataChange(metadata);
    }
  };

  const handleContinue = () => {
    // Include project metadata in the completion data
    const completeData = {
      ...localExtractedData,
      project_metadata: localProjectMetadata
    };
    onComplete(completeData);
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

      <ProjectSettingsSection
        projectMetadata={localProjectMetadata}
        onProjectMetadataChange={handleProjectMetadataChange}
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
