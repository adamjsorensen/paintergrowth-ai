import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';

interface SummaryCheckerProps {
  summary: string;
  transcript: string;
  onComplete: (missingInfo: Record<string, any>) => void;
}

interface MissingInfoItem {
  id: string;
  label: string;
  value: string;
  checked: boolean;
  type: 'text' | 'number' | 'textarea';
}

const SummaryChecker: React.FC<SummaryCheckerProps> = ({ summary, transcript, onComplete }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [missingItems, setMissingItems] = useState<MissingInfoItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  // Analyze the transcript and summary to identify missing information
  useEffect(() => {
    const analyzeTranscript = async () => {
      setIsAnalyzing(true);
      
      try {
        // In a real implementation, you would call an AI service to analyze the transcript
        // For now, we'll use a simple heuristic approach
        
        // Check for common missing information
        const items: MissingInfoItem[] = [];
        
        // Check for square footage
        if (!transcript.match(/\d+\s*(?:square\s*feet|sq\s*ft|sqft)/i)) {
          items.push({
            id: 'squareFootage',
            label: 'Approximate Square Footage',
            value: '',
            checked: false,
            type: 'number'
          });
        }
        
        // Check for timeline
        if (!transcript.match(/(?:timeline|schedule|start|begin|finish|complete|week|month|day)/i)) {
          items.push({
            id: 'timeline',
            label: 'Project Timeline',
            value: '',
            checked: false,
            type: 'text'
          });
        }
        
        // Check for color preferences
        if (!transcript.match(/(?:color|paint color|shade|tone|hue|finish)/i)) {
          items.push({
            id: 'colorPreferences',
            label: 'Color Preferences',
            value: '',
            checked: false,
            type: 'text'
          });
        }
        
        // Check for surface condition
        if (!transcript.match(/(?:condition|shape|repair|damage|hole|crack|patch)/i)) {
          items.push({
            id: 'surfaceCondition',
            label: 'Surface Condition',
            value: '',
            checked: false,
            type: 'textarea'
          });
        }
        
        // Check for special requirements
        if (!transcript.match(/(?:special|specific|particular|unique|requirement|request)/i)) {
          items.push({
            id: 'specialRequirements',
            label: 'Special Requirements',
            value: '',
            checked: false,
            type: 'textarea'
          });
        }
        
        // Add a delay to simulate AI processing
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setMissingItems(items);
      } catch (error) {
        console.error('Error analyzing transcript:', error);
      } finally {
        setIsAnalyzing(false);
        setIsLoading(false);
      }
    };
    
    analyzeTranscript();
  }, [transcript, summary]);

  // Handle checkbox change
  const handleCheckboxChange = (id: string, checked: boolean) => {
    setMissingItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, checked } : item
      )
    );
  };

  // Handle input change
  const handleInputChange = (id: string, value: string) => {
    setMissingItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, value } : item
      )
    );
  };

  // Handle continue button click
  const handleContinue = () => {
    // Create an object with the missing information
    const missingInfo = missingItems.reduce((acc, item) => {
      if (item.checked) {
        acc[item.id] = item.value;
      }
      return acc;
    }, {} as Record<string, any>);
    
    onComplete(missingInfo);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Project Summary</h3>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-800">{summary}</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Additional Information Needed</h3>
            
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-sm text-muted-foreground">Analyzing transcript...</p>
              </div>
            ) : missingItems.length === 0 ? (
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <p className="text-sm text-green-800">All necessary information was found in your recording. You can proceed to the next step.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  We couldn't find the following information in your recording. Please check the items you'd like to add and provide the missing details.
                </p>
                
                {missingItems.map(item => (
                  <div key={item.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-start space-x-2">
                      <Checkbox 
                        id={`check-${item.id}`} 
                        checked={item.checked}
                        onCheckedChange={(checked) => handleCheckboxChange(item.id, !!checked)}
                      />
                      <Label 
                        htmlFor={`check-${item.id}`}
                        className="font-medium"
                      >
                        {item.label}
                      </Label>
                    </div>
                    
                    {item.checked && (
                      <div className="pl-6">
                        {item.type === 'textarea' ? (
                          <Textarea
                            value={item.value}
                            onChange={(e) => handleInputChange(item.id, e.target.value)}
                            placeholder={`Enter ${item.label.toLowerCase()}`}
                            className="w-full"
                          />
                        ) : item.type === 'number' ? (
                          <Input
                            type="number"
                            value={item.value}
                            onChange={(e) => handleInputChange(item.id, e.target.value)}
                            placeholder={`Enter ${item.label.toLowerCase()}`}
                            className="w-full"
                          />
                        ) : (
                          <Input
                            value={item.value}
                            onChange={(e) => handleInputChange(item.id, e.target.value)}
                            placeholder={`Enter ${item.label.toLowerCase()}`}
                            className="w-full"
                          />
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={handleContinue}
              disabled={isAnalyzing}
            >
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SummaryChecker;