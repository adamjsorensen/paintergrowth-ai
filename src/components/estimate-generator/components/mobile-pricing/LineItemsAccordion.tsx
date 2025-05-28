
import React, { useRef } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Settings, Trash2 } from 'lucide-react';

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface LineItemsAccordionProps {
  lineItems: LineItem[];
  onDeleteItem: (index: number) => void;
  swipedItemIndex: number | null;
  onSwipedItemChange: (index: number | null) => void;
}

const LineItemsAccordion: React.FC<LineItemsAccordionProps> = ({
  lineItems,
  onDeleteItem,
  swipedItemIndex,
  onSwipedItemChange
}) => {
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

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
        onSwipedItemChange(index);
      } else {
        // Right swipe - hide delete
        onSwipedItemChange(null);
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  return (
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
                        Qty: {item.quantity ?? 0} × ${(item.unitPrice ?? 0).toLocaleString()}
                      </div>
                    </div>
                    <div className="font-medium text-sm">
                      ${(item.total ?? 0).toLocaleString()}
                    </div>
                  </div>
                </div>
                
                {/* Delete Button (revealed on swipe) */}
                {swipedItemIndex === index && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 min-h-[56px] min-w-[72px]"
                    onClick={() => onDeleteItem(index)}
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
  );
};

export default LineItemsAccordion;
