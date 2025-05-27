
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, ExternalLink } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface InlineProjectTypeSelectorProps {
  onSelect: (type: 'interior' | 'exterior') => void;
}

const InlineProjectTypeSelector: React.FC<InlineProjectTypeSelectorProps> = ({ onSelect }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Project Type</CardTitle>
        <CardDescription>
          Choose the type of project you're estimating to get started
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
          <button
            type="button"
            className={cn(
              "relative rounded-lg px-5 py-6 cursor-pointer transition-all duration-200 flex flex-col items-center gap-3 shadow-sm border-2 w-full",
              "bg-blue-50 hover:bg-blue-100 border-blue-500 text-blue-700 font-medium hover:shadow-md"
            )}
            onClick={() => onSelect('interior')}
          >
            <Home className="h-8 w-8 text-blue-600" />
            <span className="font-medium text-lg">Interior</span>
            <span className="text-sm text-blue-600">Paint interior spaces</span>
          </button>
          
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative w-full">
                  <div
                    className="rounded-lg px-5 py-6 bg-gray-100 text-gray-500 cursor-not-allowed border-2 border-dashed border-gray-300 flex flex-col items-center gap-3"
                  >
                    <ExternalLink className="h-8 w-8" />
                    <span className="font-medium text-lg">Exterior</span>
                    <span className="text-sm">Paint exterior surfaces</span>
                    <div className="absolute -top-2 -right-2 overflow-hidden">
                      <div className="bg-amber-500 text-white text-xs px-2 py-0.5 font-medium rounded-md transform rotate-2 shadow-sm">
                        Coming Soon
                      </div>
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
      </CardContent>
    </Card>
  );
};

export default InlineProjectTypeSelector;
