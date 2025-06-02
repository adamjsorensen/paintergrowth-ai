
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ProjectMetadata } from '../../types/ProjectMetadata';

interface ProjectSettingsCardProps {
  projectMetadata: ProjectMetadata;
  onProjectMetadataChange: (metadata: ProjectMetadata) => void;
}

const ProjectSettingsCard: React.FC<ProjectSettingsCardProps> = ({
  projectMetadata,
  onProjectMetadataChange
}) => {
  const handleFieldChange = (field: keyof ProjectMetadata, value: any) => {
    onProjectMetadataChange({
      ...projectMetadata,
      [field]: value
    });
  };

  return (
    <div className="space-y-4">
      {/* Trim Color */}
      <div className="space-y-2">
        <Label htmlFor="trimColor">Trim Color</Label>
        <Input
          id="trimColor"
          value={projectMetadata.trimColor}
          onChange={(e) => handleFieldChange('trimColor', e.target.value)}
          placeholder="e.g., Semi-Gloss White"
        />
      </div>

      {/* Number of Coats */}
      <div className="space-y-3">
        <Label>Number of Coats</Label>
        <RadioGroup
          value={projectMetadata.coats}
          onValueChange={(value) => handleFieldChange('coats', value)}
          className="flex gap-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="one" id="one-coat" />
            <Label htmlFor="one-coat">One</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="two" id="two-coats" />
            <Label htmlFor="two-coats">Two</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Paint Type */}
      <div className="space-y-2">
        <Label htmlFor="paintType">Paint Type</Label>
        <Input
          id="paintType"
          value={projectMetadata.paintType}
          onChange={(e) => handleFieldChange('paintType', e.target.value)}
          placeholder="e.g., Sherwin Williams ProClassic"
        />
      </div>
    </div>
  );
};

export default ProjectSettingsCard;
