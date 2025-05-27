
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import PricingTotalCard from './mobile-pricing/PricingTotalCard';
import ProjectOverviewCard from './mobile-pricing/ProjectOverviewCard';
import LineItemsAccordion from './mobile-pricing/LineItemsAccordion';
import AddLineItemSheet from './mobile-pricing/AddLineItemSheet';

interface MobilePricingStepProps {
  transcript: string;
  summary: string;
  missingInfo: Record<string, any>;
  projectType: 'interior' | 'exterior';
  extractedData: Record<string, any>;
  lineItems?: any[]; // Accept line items from parent
  totals?: Record<string, any>; // Accept totals from parent
  onComplete: (fields: Record<string, any>, finalEstimate: Record<string, any>) => void;
  onPricingUpdate?: (lineItems: any[], totals: Record<string, any>) => void; // Notify parent of changes
}

interface LineItem {
  id: string;
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
  lineItems: propLineItems = [],
  totals: propTotals = {},
  onComplete,
  onPricingUpdate
}) => {
  // Use prop line items if provided, otherwise use default mock data
  const [lineItems, setLineItems] = useState<LineItem[]>(
    propLineItems.length > 0 ? propLineItems : [
      { id: '1', description: 'Interior wall painting - Living room', quantity: 1, rate: 450.00, amount: 450.00 },
      { id: '2', description: 'Interior wall painting - Master bedroom', quantity: 1, rate: 350.00, amount: 350.00 },
      { id: '3', description: 'Interior wall painting - Kitchen', quantity: 1, rate: 400.00, amount: 400.00 },
      { id: '4', description: 'Trim and baseboards', quantity: 3, rate: 150.00, amount: 450.00 },
      { id: '5', description: 'Materials and supplies', quantity: 1, rate: 800.00, amount: 800.00 }
    ]
  );

  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    room: '',
    quantity: 1,
    rate: 0
  });

  const [swipedItemIndex, setSwipedItemIndex] = useState<number | null>(null);

  // Update local line items when props change
  useEffect(() => {
    if (propLineItems.length > 0) {
      console.log('MobilePricingStep - Updating line items from props:', propLineItems);
      setLineItems(propLineItems);
    }
  }, [propLineItems]);

  const calculateTotals = (items: LineItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  // Use prop totals if provided, otherwise calculate from line items
  const totals = Object.keys(propTotals).length > 0 ? propTotals : calculateTotals(lineItems);

  const handleDeleteItem = (index: number) => {
    const updatedItems = lineItems.filter((_, i) => i !== index);
    setLineItems(updatedItems);
    setSwipedItemIndex(null);
    
    // Notify parent of changes
    if (onPricingUpdate) {
      const newTotals = calculateTotals(updatedItems);
      onPricingUpdate(updatedItems, newTotals);
    }
  };

  const handleAddItem = () => {
    if (newItem.room && newItem.quantity > 0 && newItem.rate > 0) {
      const amount = newItem.quantity * newItem.rate;
      const item: LineItem = {
        id: `item-${Date.now()}`, // Generate unique ID
        description: newItem.room,
        quantity: newItem.quantity,
        rate: newItem.rate,
        amount
      };
      const updatedItems = [...lineItems, item];
      setLineItems(updatedItems);
      setNewItem({ room: '', quantity: 1, rate: 0 });
      setIsAddSheetOpen(false);
      
      // Notify parent of changes
      if (onPricingUpdate) {
        const newTotals = calculateTotals(updatedItems);
        onPricingUpdate(updatedItems, newTotals);
      }
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
      totals: totals
    };
    onComplete(fields, finalEstimate);
  };

  console.log('MobilePricingStep - Current state:', { lineItems, totals, propLineItems, propTotals });

  return (
    <div className="px-4 py-6 space-y-6 relative">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Estimate Summary</h2>
        <p className="text-gray-600 text-sm">Review your project estimate</p>
      </div>

      <PricingTotalCard 
        subtotal={totals.subtotal || 0}
        tax={totals.tax || 0}
        total={totals.total || 0}
      />

      <ProjectOverviewCard summary={summary} />

      <LineItemsAccordion
        lineItems={lineItems}
        onDeleteItem={handleDeleteItem}
        swipedItemIndex={swipedItemIndex}
        onSwipedItemChange={setSwipedItemIndex}
      />

      {/* Floating Add Button */}
      <Button
        variant="secondary"
        size="icon"
        className="fixed bottom-24 right-6 h-14 w-14 rounded-full shadow-lg z-10"
        onClick={() => setIsAddSheetOpen(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>

      <AddLineItemSheet
        isOpen={isAddSheetOpen}
        onOpenChange={setIsAddSheetOpen}
        newItem={newItem}
        onNewItemChange={setNewItem}
        onAddItem={handleAddItem}
        roomOptions={roomOptions}
      />

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
