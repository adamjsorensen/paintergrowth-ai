
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EstimateContentGeneratorProps {
  estimateData: Record<string, any>;
  projectType: 'interior' | 'exterior';
  lineItems: any[];
  totals: Record<string, any>;
  onComplete: (content: Record<string, any>) => void;
}

const EstimateContentGenerator: React.FC<EstimateContentGeneratorProps> = ({
  estimateData,
  projectType,
  lineItems,
  totals,
  onComplete
}) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<Record<string, any> | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auto-generate content when component mounts
  useEffect(() => {
    generateContent();
  }, []);

  const generateContent = async () => {
    setIsGenerating(true);
    setError(null);
    
    console.log('Generating content with:', {
      estimateData,
      projectType,
      lineItems,
      totals
    });

    try {
      const { data, error: functionError } = await supabase.functions.invoke('generate-estimate-content', {
        body: {
          estimateData,
          projectType,
          lineItems,
          totals,
          purpose: 'pdf_summary'
        }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (!data) {
        throw new Error('No content generated');
      }

      console.log('Content generated:', data);
      setGeneratedContent(data);
      
      toast({
        title: "Content Generated",
        description: "Your estimate content has been generated successfully.",
      });

    } catch (err) {
      console.error('Error generating content:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate content');
      
      toast({
        title: "Generation Failed",
        description: "Failed to generate estimate content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleContinue = () => {
    if (generatedContent) {
      onComplete(generatedContent);
    }
  };

  const handleRegenerate = () => {
    generateContent();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Estimate Content Generation</h3>
            <p className="text-sm text-muted-foreground mb-4">
              AI is generating professional content for your estimate based on the collected information.
            </p>
          </div>

          {isGenerating && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-sm text-muted-foreground">Generating estimate content...</p>
              <p className="text-xs text-muted-foreground mt-2">This may take a few seconds</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Content Generation Failed</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                  <div className="mt-3">
                    <Button 
                      onClick={handleRegenerate}
                      variant="outline"
                      size="sm"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {generatedContent && !isGenerating && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-sm font-medium text-green-800">Content Generated Successfully</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <h4 className="font-medium text-gray-900">Generated Content Preview:</h4>
                
                {Object.entries(generatedContent).map(([section, content]) => (
                  <div key={section} className="border-b border-gray-200 pb-3 last:border-b-0">
                    <h5 className="text-sm font-medium text-gray-700 mb-1 capitalize">
                      {section.replace(/([A-Z])/g, ' $1').trim()}
                    </h5>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {typeof content === 'string' ? content : JSON.stringify(content)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button onClick={handleRegenerate} variant="outline">
                  Regenerate Content
                </Button>
                <Button onClick={handleContinue} className="flex-1">
                  Continue to Edit Content
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EstimateContentGenerator;
