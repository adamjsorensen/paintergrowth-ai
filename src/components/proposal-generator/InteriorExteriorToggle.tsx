
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Home, ExternalLink } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface InteriorExteriorToggleProps {
  value: 'interior' | 'exterior';
  onChange: (value: 'interior' | 'exterior') => void;
}

const InteriorExteriorToggle: React.FC<InteriorExteriorToggleProps> = ({ value, onChange }) => {
  return (
    <div className="flex items-center justify-center space-x-4">
      <button
        type="button"
        className={cn(
          "relative rounded-lg px-5 py-3 cursor-pointer transition-all duration-200 flex items-center gap-2 shadow-sm border-2",
          value === 'interior' 
            ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium shadow' 
            : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300'
        )}
        onClick={() => onChange('interior')}
      >
        <Home className={cn(
          "h-4 w-4 transition-colors",
          value === 'interior' ? "text-blue-600" : "text-gray-500"
        )} />
        <span className="font-medium">Interior</span>
      </button>
      
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative">
              <div
                className="rounded-lg px-5 py-3 bg-gray-100 text-gray-500 cursor-not-allowed border-2 border-dashed border-gray-300 flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="font-medium">Exterior</span>
                <div className="absolute -top-2 -right-2 overflow-hidden">
                  <div className="bg-amber-500 text-white text-xs px-2 py-0.5 font-medium rounded-md transform rotate-2 shadow-sm">
                    Coming Soon
                  </div>
                </div>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm">Exterior painting options will be available soon!</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default InteriorExteriorToggle;
