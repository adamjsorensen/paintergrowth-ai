
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';

interface PricingTotalCardProps {
  subtotal: number;
  tax: number;
  total: number;
}

const PricingTotalCard: React.FC<PricingTotalCardProps> = ({
  subtotal,
  tax,
  total
}) => {
  return (
    <Card className="border-2 border-blue-200 bg-blue-50">
      <CardContent className="p-6 text-center">
        <div className="flex items-center justify-center mb-2">
          <DollarSign className="h-6 w-6 text-blue-600 mr-1" />
          <span className="text-sm font-medium text-blue-700">Total Estimate</span>
        </div>
        <div className="text-3xl font-bold text-blue-900 mb-1">
          ${total.toLocaleString()}
        </div>
        <div className="text-sm text-blue-700">
          Subtotal: ${subtotal.toLocaleString()} + Tax: ${tax.toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
};

export default PricingTotalCard;
