
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface EditFieldSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingField: any;
  editValue: string;
  onEditValueChange: (value: string) => void;
  onSave: () => void;
}

const EditFieldSheet: React.FC<EditFieldSheetProps> = ({
  isOpen,
  onOpenChange,
  editingField,
  editValue,
  onEditValueChange,
  onSave
}) => {
  const getInputType = (fieldName: string) => {
    const name = fieldName.toLowerCase();
    if (name.includes('email')) return 'email';
    if (name.includes('phone') || name.includes('tel')) return 'tel';
    if (name.includes('date')) return 'date';
    if (name.includes('address') || name.includes('description') || name.includes('notes')) return 'textarea';
    return 'text';
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[70vh]">
        <SheetHeader>
          <SheetTitle>Edit {editingField?.name}</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-6">
          <div>
            <Label htmlFor="edit-field" className="text-sm font-medium">
              {editingField?.name}
            </Label>
            {getInputType(editingField?.name || '') === 'textarea' ? (
              <Textarea
                id="edit-field"
                value={editValue}
                onChange={(e) => onEditValueChange(e.target.value)}
                className="mt-2 min-h-[100px]"
                placeholder={`Enter ${editingField?.name?.toLowerCase()}`}
              />
            ) : (
              <Input
                id="edit-field"
                type={getInputType(editingField?.name || '')}
                value={editValue}
                onChange={(e) => onEditValueChange(e.target.value)}
                className="mt-2"
                placeholder={`Enter ${editingField?.name?.toLowerCase()}`}
              />
            )}
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
              onClick={onSave}
              className="flex-1 min-h-[56px]"
            >
              Save
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default EditFieldSheet;
