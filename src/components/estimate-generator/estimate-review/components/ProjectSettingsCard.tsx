
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <Card>
      <CardHeader>
        <CardTitle>Project Settings</CardTitle>
        <p className="text-sm text-muted-foreground">
          Additional project details and specifications
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
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
          </div>

          {/* Right Column */}
          <div className="space-y-4">
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
                    className="p-3"
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

        {/* Full Width Fields */}
        <div className="space-y-4">
          {/* Project Notes */}
          <div className="space-y-2">
            <Label htmlFor="projectNotes">Project Notes</Label>
            <Textarea
              id="projectNotes"
              value={projectMetadata.projectNotes}
              onChange={(e) => handleFieldChange('projectNotes', e.target.value)}
              placeholder="Special requirements, preparation needs, project considerations, or other relevant details..."
              rows={3}
            />
          </div>

          {/* Internal Notes */}
          <div className="space-y-2">
            <Label htmlFor="internalNotes">Internal Notes</Label>
            <Textarea
              id="internalNotes"
              value={projectMetadata.internalNotes}
              onChange={(e) => handleFieldChange('internalNotes', e.target.value)}
              placeholder="Sales notes, customer preferences, team communication, or internal reminders..."
              rows={3}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectSettingsCard;
