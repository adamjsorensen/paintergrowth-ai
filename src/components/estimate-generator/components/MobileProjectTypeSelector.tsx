
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Home, ExternalLink } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface MobileProjectTypeSelectorProps {
  onSelect: (type: 'interior' | 'exterior') => void;
}

const MobileProjectTypeSelector: React.FC<MobileProjectTypeSelectorProps> = ({ onSelect }) => {
  return (
    <div className="px-4 py-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Select Project Type</h2>
        <p className="text-gray-600 text-sm">Choose the type of project you're estimating</p>
      </div>
      
      <div className="space-y-4">
        <button
          type="button"
          className="w-full min-h-[80px] rounded-xl bg-blue-50 hover:bg-blue-100 border-2 border-blue-500 text-blue-700 font-medium transition-all duration-200 flex items-center justify-center gap-4 p-6 shadow-sm hover:shadow-md active:scale-95"
          onClick={() => onSelect('interior')}
        >
          <Home className="h-8 w-8 text-blue-600" />
          <div className="text-left">
            <div className="font-medium text-lg">Interior</div>
            <div className="text-sm text-blue-600">Paint interior spaces</div>
          </div>
        </button>
        
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-full min-h-[80px] rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed border-2 border-dashed border-gray-300 flex items-center justify-center gap-4 p-6 relative">
                <ExternalLink className="h-8 w-8" />
                <div className="text-left">
                  <div className="font-medium text-lg">Exterior</div>
                  <div className="text-sm">Paint exterior surfaces</div>
                </div>
                <div className="absolute top-2 right-2">
                  <div className="bg-amber-500 text-white text-xs px-2 py-1 font-medium rounded-md">
                    Coming Soon
                  </div>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">Exterior estimating will be available soon!</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default MobileProjectTypeSelector;
