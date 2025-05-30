
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { formatCurrency } from '@/utils/formatUtils';

interface DiscountSettings {
  enabled: boolean;
  type: 'fixed' | 'percentage';
  value: number;
  notes: string;
}

interface EstimateDetailsTableProps {
  subtotal: number;
  onSubtotalChange: (value: number) => void;
  discount: DiscountSettings;
  onDiscountChange: (discount: DiscountSettings) => void;
  tax: number;
  total: number;
  taxRate: number;
  onTaxRateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const EstimateDetailsTable: React.FC<EstimateDetailsTableProps> = ({
  subtotal,
  onSubtotalChange,
  discount,
  onDiscountChange,
  tax,
  total,
  taxRate,
  onTaxRateChange
}) => {
  const handleSubtotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    if (value >= 0) {
      onSubtotalChange(value);
    }
  };

  const handleDiscountToggle = (enabled: boolean) => {
    onDiscountChange({ ...discount, enabled });
  };

  const handleDiscountTypeChange = (type: 'fixed' | 'percentage') => {
    onDiscountChange({ ...discount, type });
  };

  const handleDiscountValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseFloat(e.target.value) || 0;
    
    // Validation
    if (value < 0) value = 0;
    if (discount.type === 'percentage' && value > 100) value = 100;
    
    onDiscountChange({ ...discount, value });
  };

  const handleDiscountNotesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDiscountChange({ ...discount, notes: e.target.value });
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

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium mb-6">Estimate Details</h3>
        
        {/* Subtotal Input */}
        <div className="space-y-4 mb-6">
          <div>
            <Label htmlFor="subtotal" className="text-sm font-medium mb-2 block">
              Project Subtotal
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <Input
                id="subtotal"
                type="number"
                min="0"
                step="0.01"
                value={subtotal}
                onChange={handleSubtotalChange}
                className="pl-7 text-lg font-medium"
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
            <Label htmlFor="discount-toggle" className="font-medium">
              Apply Discount
            </Label>
          </div>

          {discount.enabled && (
            <div className="space-y-4">
              {/* Discount Type and Value - Stack on mobile */}
              <div className="flex flex-col md:flex-row md:items-end gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Discount Type</Label>
                  <RadioGroup
                    value={discount.type}
                    onValueChange={handleDiscountTypeChange}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="fixed" id="fixed" />
                      <Label htmlFor="fixed">$ Fixed Amount</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="percentage" id="percentage" />
                      <Label htmlFor="percentage">% Percentage</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount-value" className="text-sm font-medium">
                    Discount Value
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
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
                      className="pl-7 w-32"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* Discount Notes */}
              <div className="space-y-2">
                <Label htmlFor="discount-notes" className="text-sm font-medium">
                  Discount Notes (Optional)
                </Label>
                <Input
                  id="discount-notes"
                  type="text"
                  value={discount.notes}
                  onChange={handleDiscountNotesChange}
                  placeholder="e.g., 10% off for repeat customers"
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Totals Section */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-medium">Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>

          {discount.enabled && discountAmount > 0 && (
            <div className="flex justify-between items-center text-green-600">
              <span className="font-medium">
                Discount ({discount.type === 'fixed' ? formatCurrency(discount.value) : `${discount.value}%`})
              </span>
              <span>-{formatCurrency(discountAmount)}</span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="font-medium">Tax Rate (%)</span>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={taxRate}
                onChange={onTaxRateChange}
                className="w-20"
              />
            </div>
            <span>{formatCurrency(tax)}</span>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-gray-200">
            <span className="text-lg font-bold">Total</span>
            <span className="text-lg font-bold">{formatCurrency(total)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EstimateDetailsTable;
