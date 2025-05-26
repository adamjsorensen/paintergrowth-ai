
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface EstimateContentEditorProps {
  content: Record<string, any>;
  onComplete: (editedContent: Record<string, any>) => void;
  onBack: () => void;
}

const EstimateContentEditor: React.FC<EstimateContentEditorProps> = ({
  content,
  onComplete,
  onBack
}) => {
  const { toast } = useToast();
  const [editedContent, setEditedContent] = useState(content);
  const [activeTab, setActiveTab] = useState('projectOverview');

  const contentSections = [
    { id: 'projectOverview', label: 'Project Overview', type: 'textarea' },
    { id: 'scopeOfWork', label: 'Scope of Work', type: 'textarea' },
    { id: 'materialsAndLabor', label: 'Materials & Labor', type: 'textarea' },
    { id: 'timeline', label: 'Timeline', type: 'text' },
    { id: 'termsAndConditions', label: 'Terms & Conditions', type: 'textarea' },
    { id: 'additionalNotes', label: 'Additional Notes', type: 'textarea' }
  ];

  const handleContentChange = (sectionId: string, value: string) => {
    setEditedContent(prev => ({
      ...prev,
      [sectionId]: value
    }));
  };

  const handleSave = () => {
    // Validate that all sections have content
    const missingContent = contentSections.filter(section => 
      !editedContent[section.id] || editedContent[section.id].trim() === ''
    );

    if (missingContent.length > 0) {
      toast({
        title: "Content Required",
        description: `Please add content for: ${missingContent.map(s => s.label).join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    console.log('EstimateContentEditor - Saving edited content:', editedContent);
    onComplete(editedContent);
  };

  const handlePreview = () => {
    toast({
      title: "Preview",
      description: "Preview functionality will be available in the PDF generation step.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Estimate Content</CardTitle>
          <p className="text-sm text-muted-foreground">
            Review and modify the AI-generated content for your estimate. All sections are editable.
          </p>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
              {contentSections.map(section => (
                <TabsTrigger 
                  key={section.id} 
                  value={section.id}
                  className="text-xs"
                >
                  {section.label.split(' ')[0]}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {contentSections.map(section => (
              <TabsContent key={section.id} value={section.id} className="space-y-4">
                <div>
                  <Label htmlFor={section.id} className="text-base font-medium">
                    {section.label}
                  </Label>
                  
                  {section.type === 'textarea' ? (
                    <Textarea
                      id={section.id}
                      value={editedContent[section.id] || ''}
                      onChange={(e) => handleContentChange(section.id, e.target.value)}
                      placeholder={`Enter ${section.label.toLowerCase()}`}
                      rows={12}
                      className="mt-2 min-h-[300px]"
                    />
                  ) : (
                    <Input
                      id={section.id}
                      value={editedContent[section.id] || ''}
                      onChange={(e) => handleContentChange(section.id, e.target.value)}
                      placeholder={`Enter ${section.label.toLowerCase()}`}
                      className="mt-2"
                    />
                  )}
                  
                  <p className="text-xs text-muted-foreground mt-1">
                    Characters: {(editedContent[section.id] || '').length}
                  </p>
                </div>
              </TabsContent>
            ))}
          </Tabs>
          
          <div className="flex gap-3 mt-6 pt-6 border-t">
            <Button onClick={onBack} variant="outline">
              Back to Content Generation
            </Button>
            <Button onClick={handlePreview} variant="outline">
              Preview Content
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Continue to PDF Generation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EstimateContentEditor;
