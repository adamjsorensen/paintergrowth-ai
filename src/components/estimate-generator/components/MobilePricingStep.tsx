
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { DollarSign, Settings, Eye } from 'lucide-react';

interface MobilePricingStepProps {
  transcript: string;
  summary: string;
  missingInfo: Record<string, any>;
  projectType: 'interior' | 'exterior';
  extractedData: Record<string, any>;
  onComplete: (fields: Record<string, any>, finalEstimate: Record<string, any>) => void;
}

const MobilePricingStep: React.FC<MobilePricingStepProps> = ({
  transcript,
  summary,
  missingInfo,
  projectType,
  extractedData,
  onComplete
}) => {
  // Mock data for demonstration - in real app this would come from EstimateReview
  const [estimateData] = useState({
    subtotal: 2450.00,
    tax: 196.00,
    total: 2646.00,
    lineItems: [
      { description: 'Interior wall painting - Living room', quantity: 1, rate: 450.00, amount: 450.00 },
      { description: 'Interior wall painting - Master bedroom', quantity: 1, rate: 350.00, amount: 350.00 },
      { description: 'Interior wall painting - Kitchen', quantity: 1, rate: 400.00, amount: 400.00 },
      { description: 'Trim and baseboards', quantity: 3, rate: 150.00, amount: 450.00 },
      { description: 'Materials and supplies', quantity: 1, rate: 800.00, amount: 800.00 }
    ]
  });

  const handleContinue = () => {
    const fields = { ...extractedData, ...missingInfo };
    const finalEstimate = {
      lineItems: estimateData.lineItems,
      totals: {
        subtotal: estimateData.subtotal,
        tax: estimateData.tax,
        total: estimateData.total
      }
    };
    onComplete(fields, finalEstimate);
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Estimate Summary</h2>
        <p className="text-gray-600 text-sm">Review your project estimate</p>
      </div>

      {/* Total Price Card */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center mb-2">
            <DollarSign className="h-6 w-6 text-blue-600 mr-1" />
            <span className="text-sm font-medium text-blue-700">Total Estimate</span>
          </div>
          <div className="text-3xl font-bold text-blue-900 mb-1">
            ${estimateData.total.toLocaleString()}
          </div>
          <div className="text-sm text-blue-700">
            Subtotal: ${estimateData.subtotal.toLocaleString()} + Tax: ${estimateData.tax.toLocaleString()}
          </div>
        </CardContent>
      </Card>

      {/* Project Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Eye className="h-4 w-4 text-gray-600" />
            Project Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
        </CardContent>
      </Card>

      {/* Line Items Accordion */}
      <Accordion type="single" collapsible>
        <AccordionItem value="line-items">
          <AccordionTrigger className="min-h-[56px] text-base font-medium px-4 bg-gray-50 rounded-t-lg">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Adjust Estimate Details
            </div>
          </AccordionTrigger>
          <AccordionContent className="bg-gray-50 px-4 pb-4 rounded-b-lg">
            <div className="space-y-3 pt-3">
              {estimateData.lineItems.map((item, index) => (
                <div key={index} className="bg-white p-3 rounded-lg border">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900">{item.description}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        Qty: {item.quantity} × ${item.rate.toLocaleString()}
                      </div>
                    </div>
                    <div className="font-medium text-sm">
                      ${item.amount.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Mobile-friendly continue button */}
      <div className="pt-4">
        <Button 
          onClick={handleContinue}
          className="w-full min-h-[56px] text-lg font-medium"
          size="lg"
        >
          Generate Proposal
        </Button>
      </div>
    </div>
  );
};

export default MobilePricingStep;
