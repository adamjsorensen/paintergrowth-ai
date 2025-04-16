
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { FieldConfig, TaxSettings } from "@/types/prompt-templates";
import { formatCurrency } from "@/utils/formatUtils";

interface TaxCalculatorFieldProps {
  field: FieldConfig;
  value: TaxSettings;
  onChange: (value: TaxSettings) => void;
  subtotal?: number;
  isAdvanced?: boolean;
}

const TaxCalculatorField = ({ 
  field, 
  value = { rate: 0, applyToMaterials: true, applyToLabor: true }, 
  onChange,
  subtotal = 0,
  isAdvanced 
}: TaxCalculatorFieldProps) => {
  const [taxSettings, setTaxSettings] = useState<TaxSettings>(() => {
    // Initialize with default or provided values
    return {
      rate: value?.rate || 0,
      enabled: value?.enabled || false,
      applyToMaterials: value?.applyToMaterials || true,
      applyToLabor: value?.applyToLabor || true
    };
  });

  const [taxAmount, setTaxAmount] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(subtotal);

  useEffect(() => {
    // Calculate tax amount and total
    if (taxSettings.enabled && subtotal > 0) {
      const calculatedTax = subtotal * (taxSettings.rate / 100);
      setTaxAmount(calculatedTax);
      setTotalAmount(subtotal + calculatedTax);
    } else {
      setTaxAmount(0);
      setTotalAmount(subtotal);
    }
    
    // Notify parent component of changes
    onChange(taxSettings);
  }, [taxSettings, subtotal, onChange]);

  const handleIncludeTaxChange = (checked: boolean) => {
    setTaxSettings(prev => ({ ...prev, enabled: checked }));
  };

  const handleTaxRateChange = (rate: string) => {
    const parsedRate = parseFloat(rate) || 0;
    setTaxSettings(prev => ({ ...prev, rate: parsedRate }));
  };

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      {field.helpText && (
        <p className="text-sm text-muted-foreground">{field.helpText}</p>
      )}
      
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-center space-x-2">
          <Switch 
            id="include-tax"
            checked={taxSettings.enabled}
            onCheckedChange={handleIncludeTaxChange}
          />
          <Label htmlFor="include-tax">Include Tax</Label>
        </div>
        
        {taxSettings.enabled && (
          <div className="flex items-center gap-2">
            <Label htmlFor="tax-rate" className="whitespace-nowrap">Tax Rate (%)</Label>
            <Input
              id="tax-rate"
              type="number"
              value={taxSettings.rate === 0 ? "" : taxSettings.rate}
              onChange={(e) => handleTaxRateChange(e.target.value)}
              placeholder="0.00"
              className="w-20"
              min={0}
              max={100}
              step={0.1}
            />
          </div>
        )}
      </div>
      
      <div className="border rounded-md p-4 mt-4 bg-slate-50">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          
          {taxSettings.enabled && (
            <div className="flex justify-between text-sm">
              <span>Tax ({taxSettings.rate}%)</span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>
          )}
          
          <div className="flex justify-between pt-2 border-t font-medium">
            <span>Total</span>
            <span>{formatCurrency(totalAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxCalculatorField;
