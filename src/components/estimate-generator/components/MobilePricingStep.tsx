
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { DollarSign, Settings, Eye, Plus, Trash2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MobilePricingStepProps {
  transcript: string;
  summary: string;
  missingInfo: Record<string, any>;
  projectType: 'interior' | 'exterior';
  extractedData: Record<string, any>;
  onComplete: (fields: Record<string, any>, finalEstimate: Record<string, any>) => void;
}

interface LineItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

const MobilePricingStep: React.FC<MobilePricingStepProps> = ({
  transcript,
  summary,
  missingInfo,
  projectType,
  extractedData,
  onComplete
}) => {
  // Initial mock data - in real app this would come from EstimateReview
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: 'Interior wall painting - Living room', quantity: 1, rate: 450.00, amount: 450.00 },
    { description: 'Interior wall painting - Master bedroom', quantity: 1, rate: 350.00, amount: 350.00 },
    { description: 'Interior wall painting - Kitchen', quantity: 1, rate: 400.00, amount: 400.00 },
    { description: 'Trim and baseboards', quantity: 3, rate: 150.00, amount: 450.00 },
    { description: 'Materials and supplies', quantity: 1, rate: 800.00, amount: 800.00 }
  ]);

  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    room: '',
    quantity: 1,
    rate: 0
  });

  const [swipedItemIndex, setSwipedItemIndex] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const calculateTotals = (items: LineItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const totals = calculateTotals(lineItems);

  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent, index: number) => {
    if (touchStartX.current === null || touchStartY.current === null) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchStartX.current - touchEndX;
    const deltaY = Math.abs(touchStartY.current - touchEndY);

    // Only trigger swipe if horizontal movement is greater than vertical (avoid scroll conflicts)
    if (Math.abs(deltaX) > 100 && deltaY < 50) {
      if (deltaX > 0) {
        // Left swipe - show delete
        setSwipedItemIndex(index);
      } else {
        // Right swipe - hide delete
        setSwipedItemIndex(null);
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  const handleDeleteItem = (index: number) => {
    const updatedItems = lineItems.filter((_, i) => i !== index);
    setLineItems(updatedItems);
    setSwipedItemIndex(null);
  };

  const handleAddItem = () => {
    if (newItem.room && newItem.quantity > 0 && newItem.rate > 0) {
      const amount = newItem.quantity * newItem.rate;
      const item: LineItem = {
        description: newItem.room,
        quantity: newItem.quantity,
        rate: newItem.rate,
        amount
      };
      setLineItems([...lineItems, item]);
      setNewItem({ room: '', quantity: 1, rate: 0 });
      setIsAddSheetOpen(false);
    }
  };

  const roomOptions = [
    'Living Room Painting',
    'Master Bedroom Painting', 
    'Kitchen Painting',
    'Bathroom Painting',
    'Trim and Baseboards',
    'Ceiling Painting',
    'Materials and Supplies',
    'Labor - Prep Work',
    'Custom Task'
  ];

  const handleContinue = () => {
    const fields = { ...extractedData, ...missingInfo };
    const finalEstimate = {
      lineItems: lineItems,
      totals: {
        subtotal: totals.subtotal,
        tax: totals.tax,
        total: totals.total
      }
    };
    onComplete(fields, finalEstimate);
  };

  return (
    <div className="px-4 py-6 space-y-6 relative">
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
            ${totals.total.toLocaleString()}
          </div>
          <div className="text-sm text-blue-700">
            Subtotal: ${totals.subtotal.toLocaleString()} + Tax: ${totals.tax.toLocaleString()}
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
      <Accordion type="single" collapsible className="relative">
        <AccordionItem value="line-items">
          <AccordionTrigger className="min-h-[56px] text-base font-medium px-4 bg-gray-50 rounded-t-lg">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Adjust Estimate Details
            </div>
          </AccordionTrigger>
          <AccordionContent className="bg-gray-50 px-4 pb-4 rounded-b-lg">
            <div className="space-y-3 pt-3">
              {lineItems.map((item, index) => (
                <div key={index} className="relative">
                  <div
                    className="bg-white p-3 rounded-lg border transition-transform duration-200"
                    style={{
                      transform: swipedItemIndex === index ? 'translateX(-80px)' : 'translateX(0)'
                    }}
                    onTouchStart={(e) => handleTouchStart(e, index)}
                    onTouchEnd={(e) => handleTouchEnd(e, index)}
                  >
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
                  
                  {/* Delete Button (revealed on swipe) */}
                  {swipedItemIndex === index && (
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 min-h-[56px] min-w-[72px]"
                      onClick={() => handleDeleteItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Floating Add Button */}
      <Button
        variant="secondary"
        size="icon"
        className="fixed bottom-24 right-6 h-14 w-14 rounded-full shadow-lg z-10"
        onClick={() => setIsAddSheetOpen(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Add Item Sheet */}
      <Sheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen}>
        <SheetContent side="bottom" className="h-[70vh]">
          <SheetHeader>
            <SheetTitle>Add New Item</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 mt-6">
            <div>
              <Label htmlFor="room-select" className="text-sm font-medium">Room / Task</Label>
              <Select value={newItem.room} onValueChange={(value) => setNewItem({...newItem, room: value})}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select room or task" />
                </SelectTrigger>
                <SelectContent>
                  {roomOptions.map((room) => (
                    <SelectItem key={room} value={room}>{room}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity" className="text-sm font-medium">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 1})}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="rate" className="text-sm font-medium">Rate ($)</Label>
                <Input
                  id="rate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newItem.rate}
                  onChange={(e) => setNewItem({...newItem, rate: parseFloat(e.target.value) || 0})}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded">
              Total: ${((newItem.quantity || 0) * (newItem.rate || 0)).toLocaleString()}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsAddSheetOpen(false)}
                className="flex-1 min-h-[56px]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddItem}
                disabled={!newItem.room || newItem.quantity <= 0 || newItem.rate <= 0}
                className="flex-1 min-h-[56px]"
              >
                Add Item
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

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
