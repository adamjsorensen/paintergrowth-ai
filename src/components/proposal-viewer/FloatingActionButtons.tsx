
import React from 'react';
import { Copy, Save, Edit, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FloatingActionButtonsProps {
  onCopy: () => void;
  onSave: () => void;
  isEditing: boolean;
  onToggleEdit: () => void;
}

const FloatingActionButtons: React.FC<FloatingActionButtonsProps> = ({
  onCopy,
  onSave,
  isEditing,
  onToggleEdit,
}) => {
  return (
    <div className="fixed bottom-8 right-8 flex flex-col gap-3 z-50">
      <div className="flex flex-col gap-3 items-center bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-200">
        {isEditing ? (
          <>
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full w-10 h-10 hover:bg-gray-100" 
              onClick={onToggleEdit}
              title="Cancel editing"
            >
              <X className="h-5 w-5 text-gray-600" />
            </Button>
            <Button 
              variant="secondary" 
              size="icon" 
              className="rounded-full w-10 h-10" 
              onClick={onSave}
              title="Save changes"
            >
              <Save className="h-5 w-5" />
            </Button>
          </>
        ) : (
          <>
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full w-10 h-10 hover:bg-gray-100" 
              onClick={onCopy}
              title="Copy proposal"
            >
              <Copy className="h-5 w-5 text-gray-600" />
            </Button>
            <Button 
              variant="secondary" 
              size="icon" 
              className="rounded-full w-10 h-10" 
              onClick={onToggleEdit}
              title="Edit proposal"
            >
              <Edit className="h-5 w-5" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default FloatingActionButtons;
