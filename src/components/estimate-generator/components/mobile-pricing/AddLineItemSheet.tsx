
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface NewItem {
  room: string;
  quantity: number;
  rate: number;
}

interface AddLineItemSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newItem: NewItem;
  onNewItemChange: (item: NewItem) => void;
  onAddItem: () => void;
  roomOptions: string[];
}

const AddLineItemSheet: React.FC<AddLineItemSheetProps> = ({
  isOpen,
  onOpenChange,
  newItem,
  onNewItemChange,
  onAddItem,
  roomOptions
}) => {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[70vh]">
        <SheetHeader>
          <SheetTitle>Add New Item</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-6">
          <div>
            <Label htmlFor="room-select" className="text-sm font-medium">Room / Task</Label>
            <Select value={newItem.room} onValueChange={(value) => onNewItemChange({...newItem, room: value})}>
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
                onChange={(e) => onNewItemChange({...newItem, quantity: parseInt(e.target.value) || 1})}
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
                onChange={(e) => onNewItemChange({...newItem, rate: parseFloat(e.target.value) || 0})}
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
              onClick={() => onOpenChange(false)}
              className="flex-1 min-h-[56px]"
            >
              Cancel
            </Button>
            <Button
              onClick={onAddItem}
              disabled={!newItem.room || newItem.quantity <= 0 || newItem.rate <= 0}
              className="flex-1 min-h-[56px]"
            >
              Add Item
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AddLineItemSheet;
