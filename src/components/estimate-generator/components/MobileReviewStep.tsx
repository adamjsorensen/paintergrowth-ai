
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, AlertCircle, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const hasData = Object.keys(extractedData).length > 0;
  
  const getFieldStatus = (field: any) => {
    if (!field || !field.value || field.value === '') {
      return { icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50', text: 'Missing' };
    }
    return { icon: Check, color: 'text-green-500', bg: 'bg-green-50', text: 'Complete' };
  };

  const handleContinue = () => {
    onComplete(extractedData);
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
        <p className="text-gray-600 text-sm">Check the information we extracted from your input</p>
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
          <CardTitle className="text-base">Extracted Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {extractedData.fields && Array.isArray(extractedData.fields) ? (
            extractedData.fields.map((field: any, index: number) => {
              const status = getFieldStatus(field);
              const StatusIcon = status.icon;
              
              return (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900">{field.name}</div>
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
                </div>
              );
            })
          ) : (
            <div className="text-center py-4 text-gray-500">
              No specific fields extracted
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mobile-friendly continue button */}
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
