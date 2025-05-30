
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCcw } from 'lucide-react';
import PricingTotalCard from './mobile-pricing/PricingTotalCard';

interface DiscountSettings {
  enabled: boolean;
  type: 'fixed' | 'percentage';
  value: number;
  notes: string;
}

interface MobilePricingStepProps {
  transcript: string;
  summary: string;
  missingInfo: Record<string, any>;
  projectType: 'interior' | 'exterior';
  extractedData: Record<string, any>;
  subtotal?: number;
  discount?: DiscountSettings;
  taxRate?: number;
  onComplete: (fields: Record<string, any>, finalEstimate: Record<string, any>) => void;
  onPricingUpdate?: (subtotal: number, discount: DiscountSettings, taxRate: number) => void;
  onStartOver?: () => void;
}

const MobilePricingStep: React.FC<MobilePricingStepProps> = ({
  transcript,
  summary,
  missingInfo,
  projectType,
  extractedData,
  subtotal: propSubtotal = 2450.00,
  discount: propDiscount = { enabled: false, type: 'percentage', value: 0, notes: '' },
  taxRate: propTaxRate = 7.5,
  onComplete,
  onPricingUpdate,
  onStartOver
}) => {
  const [subtotal, setSubtotal] = useState(propSubtotal);
  const [discount, setDiscount] = useState<DiscountSettings>(propDiscount);
  const [taxRate, setTaxRate] = useState(propTaxRate);

  // Update local state when props change
  useEffect(() => {
    setSubtotal(propSubtotal);
  }, [propSubtotal]);

  useEffect(() => {
    setDiscount(propDiscount);
  }, [propDiscount]);

  useEffect(() => {
    setTaxRate(propTaxRate);
  }, [propTaxRate]);

  const handleSubtotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    if (value >= 0) {
      setSubtotal(value);
      if (onPricingUpdate) {
        onPricingUpdate(value, discount, taxRate);
      }
    }
  };

  const handleDiscountToggle = (enabled: boolean) => {
    const newDiscount = { ...discount, enabled };
    setDiscount(newDiscount);
    if (onPricingUpdate) {
      onPricingUpdate(subtotal, newDiscount, taxRate);
    }
  };

  const handleDiscountTypeChange = (type: 'fixed' | 'percentage') => {
    const newDiscount = { ...discount, type };
    setDiscount(newDiscount);
    if (onPricingUpdate) {
      onPricingUpdate(subtotal, newDiscount, taxRate);
    }
  };

  const handleDiscountValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseFloat(e.target.value) || 0;
    
    // Validation
    if (value < 0) value = 0;
    if (discount.type === 'percentage' && value > 100) value = 100;
    
    const newDiscount = { ...discount, value };
    setDiscount(newDiscount);
    if (onPricingUpdate) {
      onPricingUpdate(subtotal, newDiscount, taxRate);
    }
  };

  const handleDiscountNotesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDiscount = { ...discount, notes: e.target.value };
    setDiscount(newDiscount);
    if (onPricingUpdate) {
      onPricingUpdate(subtotal, newDiscount, taxRate);
    }
  };

  const handleTaxRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setTaxRate(value);
    if (onPricingUpdate) {
      onPricingUpdate(subtotal, discount, value);
    }
  };

  const calculateDiscountAmount = () => {
    if (!discount.enabled) return 0;
    
    if (discount.type === 'fixed') {
      return Math.min(discount.value, subtotal);
    } else {
      return subtotal * (discount.value / 100);
    }
  };

  const discountAmount = calculateDiscountAmount();
  const postDiscountSubtotal = subtotal - discountAmount;
  const tax = postDiscountSubtotal * (taxRate / 100);
  const total = postDiscountSubtotal + tax;

  const handleContinue = () => {
    const fields = { ...extractedData, ...missingInfo };
    const finalEstimate = {
      subtotal,
      discount,
      discountAmount,
      taxRate,
      tax,
      total
    };
    onComplete(fields, finalEstimate);
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="text-center flex-1">
          <h2 className="text-xl font-semibold mb-2">Estimate Summary</h2>
          <p className="text-gray-600 text-sm">Review and adjust your project estimate</p>
        </div>
        {onStartOver && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onStartOver}
            className="text-gray-600 hover:text-gray-900 ml-2"
          >
            <RefreshCcw className="h-4 w-4 mr-1" />
            Start Over
          </Button>
        )}
      </div>

      <PricingTotalCard 
        subtotal={subtotal}
        tax={tax}
        total={total}
      />

      {/* Estimate Details Card */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-6">Estimate Details</h3>
          
          {/* Subtotal Input */}
          <div className="space-y-4 mb-6">
            <div>
              <Label htmlFor="subtotal" className="text-base font-medium mb-3 block">
                Project Subtotal
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">$</span>
                <Input
                  id="subtotal"
                  type="number"
                  min="0"
                  step="0.01"
                  value={subtotal}
                  onChange={handleSubtotalChange}
                  className="pl-8 text-lg font-medium min-h-[56px]"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Discount Section */}
          <div className="space-y-4 mb-6 p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center space-x-3">
              <Switch
                id="discount-toggle"
                checked={discount.enabled}
                onCheckedChange={handleDiscountToggle}
              />
              <Label htmlFor="discount-toggle" className="text-base font-medium">
                Apply Discount
              </Label>
            </div>

            {discount.enabled && (
              <div className="space-y-4">
                {/* Discount Type */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Discount Type</Label>
                  <RadioGroup
                    value={discount.type}
                    onValueChange={handleDiscountTypeChange}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="fixed" id="fixed" />
                      <Label htmlFor="fixed" className="text-base">$ Fixed Amount</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="percentage" id="percentage" />
                      <Label htmlFor="percentage" className="text-base">% Percentage</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Discount Value */}
                <div className="space-y-3">
                  <Label htmlFor="discount-value" className="text-base font-medium">
                    Discount Value
                  </Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">
                      {discount.type === 'fixed' ? '$' : '%'}
                    </span>
                    <Input
                      id="discount-value"
                      type="number"
                      min="0"
                      max={discount.type === 'percentage' ? 100 : undefined}
                      step={discount.type === 'fixed' ? '0.01' : '0.1'}
                      value={discount.value}
                      onChange={handleDiscountValueChange}
                      className="pl-8 text-lg min-h-[56px]"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Discount Notes */}
                <div className="space-y-3">
                  <Label htmlFor="discount-notes" className="text-base font-medium">
                    Discount Notes (Optional)
                  </Label>
                  <Input
                    id="discount-notes"
                    type="text"
                    value={discount.notes}
                    onChange={handleDiscountNotesChange}
                    placeholder="e.g., 10% off for repeat customers"
                    className="text-base min-h-[56px]"
                    maxLength={100}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Tax Rate */}
          <div className="space-y-3 mb-6">
            <Label htmlFor="tax-rate" className="text-base font-medium">
              Tax Rate (%)
            </Label>
            <Input
              id="tax-rate"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={taxRate}
              onChange={handleTaxRateChange}
              className="text-lg min-h-[56px]"
              placeholder="7.5"
            />
          </div>
        </CardContent>
      </Card>

      {/* Continue Button */}
      <div className="pt-4 pb-20">
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
