
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/utils/formatUtils';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

interface EstimateDetailsTableProps {
  lineItems: LineItem[];
  setLineItems: React.Dispatch<React.SetStateAction<LineItem[]>>;
  subtotal: number;
  tax: number;
  total: number;
  taxRate: number;
  onTaxRateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCalculateTotals: (items: LineItem[]) => void;
}

const EstimateDetailsTable: React.FC<EstimateDetailsTableProps> = ({
  lineItems,
  setLineItems,
  subtotal,
  tax,
  total,
  taxRate,
  onTaxRateChange,
  onCalculateTotals
}) => {
  const handleUpdateLineItem = (id: string, field: keyof LineItem, value: any) => {
    const updatedItems = lineItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
        }
        
        return updatedItem;
      }
      return item;
    });
    
    setLineItems(updatedItems);
    onCalculateTotals(updatedItems);
  };

  const handleAddLineItem = () => {
    const newItem: LineItem = {
      id: `item-${Date.now()}`,
      description: 'New Item',
      quantity: 1,
      unit: 'item',
      unitPrice: 0,
      total: 0
    };
    
    const newLineItems = [...lineItems, newItem];
    setLineItems(newLineItems);
    onCalculateTotals(newLineItems);
  };

  const handleRemoveLineItem = (id: string) => {
    const newLineItems = lineItems.filter(item => item.id !== id);
    setLineItems(newLineItems);
    onCalculateTotals(newLineItems);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium mb-4">Estimate Details</h3>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="w-[100px]">Quantity</TableHead>
                <TableHead className="w-[100px]">Unit</TableHead>
                <TableHead className="w-[150px]">Unit Price</TableHead>
                <TableHead className="w-[150px]">Total</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lineItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Input
                      value={item.description}
                      onChange={(e) => handleUpdateLineItem(item.id, 'description', e.target.value)}
                      className="w-full"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      value={item.quantity}
                      onChange={(e) => handleUpdateLineItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-full"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={item.unit}
                      onChange={(e) => handleUpdateLineItem(item.id, 'unit', e.target.value)}
                      className="w-full"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2">$</span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => handleUpdateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-full pl-7"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(item.total)}
                  </TableCell>
                  <TableCell>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleRemoveLineItem(item.id)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                      </svg>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleAddLineItem}
          >
            + Add Line Item
          </Button>
        </div>
        
        {/* Totals */}
        <div className="mt-6 space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-medium">Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          
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
          
          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <span className="text-lg font-bold">Total</span>
            <span className="text-lg font-bold">{formatCurrency(total)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EstimateDetailsTable;
