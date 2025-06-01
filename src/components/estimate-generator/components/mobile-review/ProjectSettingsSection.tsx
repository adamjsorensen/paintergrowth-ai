
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ProjectMetadata } from '../../types/ProjectMetadata';

interface ProjectSettingsSectionProps {
  projectMetadata: ProjectMetadata;
  onProjectMetadataChange: (metadata: ProjectMetadata) => void;
}

const ProjectSettingsSection: React.FC<ProjectSettingsSectionProps> = ({
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
    <div className="space-y-6 bg-white rounded-lg border border-gray-200 p-4">
      <div>
        <h3 className="text-lg font-semibold mb-4">Project Settings</h3>
        <p className="text-sm text-gray-600 mb-4">Additional project details and specifications</p>
      </div>

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

        {/* Number of Wall Colors */}
        <div className="space-y-2">
          <Label htmlFor="wallColors"># of Wall Colors</Label>
          <Input
            id="wallColors"
            type="number"
            min="1"
            value={projectMetadata.wallColors}
            onChange={(e) => handleFieldChange('wallColors', parseInt(e.target.value) || 1)}
            placeholder="1"
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

        {/* Special Project Considerations */}
        <div className="space-y-2">
          <Label htmlFor="specialConsiderations">Special Project Considerations</Label>
          <Textarea
            id="specialConsiderations"
            value={projectMetadata.specialConsiderations}
            onChange={(e) => handleFieldChange('specialConsiderations', e.target.value)}
            placeholder="Any special requirements, challenges, or considerations for this project..."
            rows={3}
          />
        </div>

        {/* Sales Notes / Customer Needs */}
        <div className="space-y-2">
          <Label htmlFor="salesNotes">Sales Notes / Customer Needs</Label>
          <Textarea
            id="salesNotes"
            value={projectMetadata.salesNotes}
            onChange={(e) => handleFieldChange('salesNotes', e.target.value)}
            placeholder="Customer preferences, special requests, or sales notes..."
            rows={3}
          />
        </div>

        {/* Approximate Production Date */}
        <div className="space-y-2">
          <Label>Approximate Production Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !projectMetadata.productionDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {projectMetadata.productionDate ? (
                  format(projectMetadata.productionDate, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={projectMetadata.productionDate}
                onSelect={(date) => handleFieldChange('productionDate', date)}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Discount Percentage */}
        <div className="space-y-2">
          <Label htmlFor="discountPercent">Discount %</Label>
          <div className="relative">
            <Input
              id="discountPercent"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={projectMetadata.discountPercent}
              onChange={(e) => handleFieldChange('discountPercent', parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="pr-8"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectSettingsSection;
